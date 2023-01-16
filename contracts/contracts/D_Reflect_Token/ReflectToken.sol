//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title A Fee on Transfer token with automatic reflections to holders.
/// @notice Token contract inheriting ERC20 standard with basic access
/// @notice control and emergency pause mechanism. The token contract implements
/// @notice Fee on Transfer distributed among marketing wallet, acquisition wallets,
/// @notice and all token holders (via reflections) on Buy / Sell transactions
/// @notice only. Wallet-to-wallet transfers do not incur a fee on transfer.
contract ReflectToken is ERC20, Pausable, Ownable {
    struct FeeValues {
        uint256 Amount;
        uint256 TransferAmount;
        uint256 ReflectFee;
    }

    //------------------ STATE VARIABLES ---------------------------------------

    mapping(address => uint256) private rOwned;
    mapping(address => uint256) private tOwned;
    mapping(address => bool) private isExcluded;
    address[] private excluded;
    uint256 private tTotal;
    uint256 private rTotal;
    uint256 private tFeeTotal;
    uint8 public feeReflectPct;
    uint256 public mintLimit;

    //----------------------- EVENTS ---------------------------------------

    event FeeChanged(uint256 oldFee, uint256 newFee);
    event AccountExcluded(address indexed account);
    event AccountIncluded(address indexed account);

    //--------------------  CONSTRUCTOR ----------------------------------------

    /// @notice Sets the values for name, symbol, totalSupply.
    /// @param _name               token name.
    /// @param _symbol             token symbol.
    /// @param _supply             total token supply.
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _supply,
        uint256 _mintLimit,
        uint8 _feeReflect
    ) ERC20(_name, _symbol) {
        tTotal = _supply;
        rTotal = (~uint256(0) - (~uint256(0) % tTotal));
        feeReflectPct = _feeReflect;
        mintLimit = _mintLimit;
        tOwned[msg.sender] = tTotal;
        rOwned[msg.sender] = rTotal;
    }

    //------------------------ VIEWS -------------------------------------------

    /// @notice See {IERC20-totalSupply}.
    /// @dev Overrides ERC20 totalSupply function.
    function totalSupply() public view override returns (uint256) {
        return tTotal;
    }

    /// @notice See {IERC20-balanceOf}.
    /// @dev Overrides ERC20 balanceOf function. If account is excluded then
    /// @dev tOwned balance is returned since that tracks token balance without
    /// @dev reflections. Otherwise, rOwned balance is returned after scaling down
    /// @dev by reflection rate.
    /// @param _account              address to be checked for token balance.
    function balanceOf(
        address _account
    ) public view override returns (uint256) {
        if (isExcluded[_account]) return tOwned[_account];
        return tokenFromReflection(rOwned[_account]);
    }

    /// @notice Number of decimals for token representation.
    /// @dev Overrides ERC20 decimals function. Value of 4 decimals is required
    /// @dev to maintain precision of arithmetic operations for reflection fee
    /// @dev distributions, given a large token supply.
    function decimals() public pure override returns (uint8) {
        return 18;
    }

    /// @notice Provides scaled down amount based on current reflection rate.
    /// @dev Helper function for balanceOf function. Scales down a given amount,
    /// @dev inclusive of reflections, by reflection rate.
    /// @param _rAmount             amount to be scaled down by reflection rate.
    function tokenFromReflection(
        uint256 _rAmount
    ) public view returns (uint256) {
        require(_rAmount <= rTotal, "Amount must be less than total supply");
        uint256 currentRate = _getRate();
        return _rAmount / currentRate;
    }

    /// @notice Allows checking whether an account has been excluded from
    /// @notice receiving reflection distributions.
    /// @param _account              address to be checked if excluded from reflections.
    function isExcludedAct(address _account) public view returns (bool) {
        return isExcluded[_account];
    }

    /// @notice Allows to view total amount of reflection fees collected since
    /// @notice contract creation.
    function totalFees() public view returns (uint256) {
        return tFeeTotal;
    }

    /// @dev Calculates the required fees to be deducted for given transaction
    /// @dev amount and transaction type.
    /// @param _tAmount              amount being transferred by user.
    function _getValues(
        uint256 _tAmount
    ) private view returns (FeeValues memory, FeeValues memory) {
        uint256 currentRate = _getRate();
        FeeValues memory tValues = _getTValues(_tAmount);
        FeeValues memory rValues = _getRValues(tValues, currentRate);

        return (tValues, rValues);
    }

    /// @dev Calculates the actual
    /// @dev reflection fees to be deducted from the
    /// @dev transfer amount.
    /// @param _tAmount            amount being transferred by user.
    function _getTValues(
        uint256 _tAmount
    ) private view returns (FeeValues memory) {

        FeeValues memory tValues;
        tValues.Amount = _tAmount;
        tValues.ReflectFee = (_tAmount * feeReflectPct) / 100;
        tValues.TransferAmount = tValues.Amount - tValues.ReflectFee;

        return (tValues);
    }

    /// @dev Scales up the actual transaction fees {tValues} by reflection
    /// @dev rate to allow proper update of rOwned user balance.
    /// @param _tValues            actual transfer amount and fees to be deducted.
    /// @param _currentRate        current reflection rate.
    function _getRValues(
        FeeValues memory _tValues,
        uint256 _currentRate
    ) private pure returns (FeeValues memory) {
        FeeValues memory rValues;
        rValues.Amount = _tValues.Amount * _currentRate;
        rValues.ReflectFee = _tValues.ReflectFee * _currentRate;
        rValues.TransferAmount = rValues.Amount - rValues.ReflectFee;

        return (rValues);
    }

    /// @dev Calculates the reflection rate based on rSupply and rSupply. As
    /// @dev reflection fees are deducted from rSupply by {reflectFee} function,
    /// @dev the reflection rate will decrease, causing users' balances to increase
    /// @dev by the reflection fee in proportion to the user's balance / total supply
    function _getRate() private view returns (uint256) {
        (uint256 rSupply, uint256 tSupply) = _getCurrentSupply();
        return rSupply / tSupply;
    }

    /// @dev Calculates the scaled up and actual token supply exclusive of
    /// @dev excluded addresses. This impacts the reflection rate (greater decrease)
    /// @dev to allow included addresses to receive reflections that would have gone
    /// @dev to excluded accounts.
    function _getCurrentSupply() private view returns (uint256, uint256) {
        uint256 rSupply = rTotal;
        uint256 tSupply = tTotal;
        for (uint256 i = 0; i < excluded.length; i++) {
            if (rOwned[excluded[i]] > rSupply || tOwned[excluded[i]] > tSupply)
                return (rTotal, tTotal);

            rSupply = rSupply - rOwned[excluded[i]];
            tSupply = tSupply - tOwned[excluded[i]];
        }
        if (rSupply < rTotal / tTotal) return (rTotal, tTotal);
        return (rSupply, tSupply);
    }

    //-------------------- MUTATIVE FUNCTIONS ----------------------------------

    /// @notice See {IERC20-transfer}.
    /// @dev Overrides ERC20 _transfer function. Requires 'sender' and
    /// @dev 'recipient' to be non-zero address to prevent minting/burning and
    /// @dev non-zero transfer amount. Function determines transaction type 'BUY',
    /// @dev 'SELL', or 'NONE' depending on whether sender or recipient is exchange
    /// @dev pair address. Actual token transfer is delegated to {_transferStandard}.
    /// @dev Function is pausable by token administrator.
    /// @param _sender            address sending token.
    /// @param _recipient         address receiving token.
    /// @param _amount            number of tokens being transferred.
    function _transfer(
        address _sender,
        address _recipient,
        uint256 _amount
    ) internal override whenNotPaused {
        require(_sender != address(0), "ERC20: transfer from the zero address");
        require(
            _recipient != address(0),
            "ERC20: transfer to the zero address"
        );
        require(
            _amount > 0,
            "ERC20: transfer amount must be greater than zero"
        );
        uint256 senderBalance = balanceOf(_sender);
        require(
            senderBalance >= _amount,
            "ERC20: transfer amount exceeds balance"
        );

        _transferStandard(_sender, _recipient, _amount);
    }

    /// @dev Updates rOwned and tOwned balances after deducting applicable
    /// @dev transaction fees and allocates fees to marketing and acquisition
    /// @dev wallets. {_getValues} helper function calculates all relevant amounts.
    /// @dev Emits a {Transfer} event after the balances have been updated.
    /// @param _sender is address sending token.
    /// @param _recipient is address receiving token.
    /// @param _tAmount is number of tokens being transferred.
    function _transferStandard(
        address _sender,
        address _recipient,
        uint256 _tAmount
    ) private {
        (FeeValues memory tValues, FeeValues memory rValues) = _getValues(
            _tAmount
        );

        if (isExcluded[_sender]) {
            tOwned[_sender] -= tValues.Amount;
            rOwned[_sender] -= rValues.Amount;
        } else {
            rOwned[_sender] -= rValues.Amount;
        }

        if (isExcluded[_recipient]) {
            tOwned[_recipient] += tValues.TransferAmount;
            rOwned[_recipient] += rValues.TransferAmount;
        } else {
            rOwned[_recipient] += rValues.TransferAmount;
        }

        reflectFee(rValues.ReflectFee, tValues.ReflectFee);
        emit Transfer(_sender, _recipient, tValues.TransferAmount);
    }

    /// @dev Updates {rTotal} supply by subtracting reflection fees. Updates
    /// @dev {tFeeTotal} to add reflection fees. This is used to update the
    /// @dev reflection rate to calculate users' balances included in reflection.
    /// @param _rFee Scaled up reflection fees from transaction
    /// @param _tFee Actual reflection fees from transaction
    function reflectFee(uint256 _rFee, uint256 _tFee) private {
        rTotal = rTotal - _rFee;
        tFeeTotal = tFeeTotal + _tFee;
    }

    //----------------------------- RESTRICTED FUNCTIONS ---------------------------

    /// @notice Changes the reflection fee
    /// @notice percentages to be deducted from {SELL} transaction type.
    /// @param _reflectFees is the new reflection fee percentage.
    function setReflectFees(uint8 _reflectFees) external onlyOwner {
        require(
            _reflectFees < 100,
            "FeeOnTransfer: Total fee percentage must be less than 100%"
        );
        emit FeeChanged(feeReflectPct, _reflectFees);
        feeReflectPct = _reflectFees;
    }

    /// @notice Removes address from receiving future reflection distributions.
    /// @param _account            to be excluded from reflections.
    function excludeAccount(address _account) external onlyOwner {
        require(
            !isExcluded[_account],
            "FeeOnTransfer: Account already excluded"
        );
        require(
            balanceOf(_account) < tTotal,
            "FeeOnTransfer: Cannot exclude total supply"
        );

        tOwned[_account] = balanceOf(_account);
        excluded.push(_account);
        isExcluded[_account] = true;
        emit AccountExcluded(_account);
    }

    /// @notice Includes previously excluded address to receive reflection
    /// @notice distributions in case of erroneously excluded address. NOTE: Included
    /// @notice address will receive all previous reflection distribution it should
    /// @notice have received while address was excluded.
    /// @param _account             to be re-included to reflections.
    function includeAccount(address _account) external onlyOwner {
        require(
            isExcluded[_account],
            "FeeOnTransfer: Account already included"
        );

        for (uint256 i = 0; i < excluded.length; i++) {
            if (excluded[i] == _account) {
                excluded[i] = excluded[excluded.length - 1];
                excluded.pop();
                isExcluded[_account] = false;
                break;
            }
        }

        emit AccountIncluded(_account);
    }

    /// @notice Pauses token transfer functionality in case of emergency.
    function lockToken() external onlyOwner {
        _pause();
    }

    /// @notice Unpauses token transfer functionality to allow users to
    /// transfer token. Can only be updated by administrator.
    function unlockToken() external onlyOwner {
        _unpause();
    }
}
