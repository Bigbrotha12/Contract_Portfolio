// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {DemoToken} from "../A_ERC20/DemoToken.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title A Fee on Transfer token with automatic reflections to holders.
/// @author Rafael Mendoza
/// @notice Token contract inheriting ERC20 standard with basic access control and emergency pause mechanism. The token
/// @notice contract implements Fee on Transfer distributed among owners wallets, and all token holders
/// @notice (via reflections) on Buy/Sell transactions only. Wallet-to-wallet transfers do not incur a fee on transfer.
contract ReflectToken is ERC20, Pausable, Ownable {

    struct FeeValues {
        uint256 Amount;
        uint256 TransferAmount;
        uint256 ReflectFee;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    mapping(address user => uint256 amount) private s_rOwned;
    mapping(address user => uint256 amount) private s_tOwned;
    mapping(address user => bool status) private s_isExcluded;
    address[] private s_excluded;
    uint256 private s_tTotal;
    uint256 private s_rTotal;
    uint256 private s_tFeeTotal;
    uint8 public s_feeReflectPct;
    uint256 public s_limit;
    DemoToken public s_purchaseToken;
    uint256 public s_price;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    event FeeChanged(uint256 oldFee, uint256 newFee);
    event AccountExcluded(address indexed account);
    event AccountIncluded(address indexed account);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 ERRORS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    error ReflectToken__LimitExceeded(uint256 amount, uint256 limit);
    error ReflectToken__InsufficientFunds(uint256 amount, uint256 available);
    error ReflectToken__FeeExceedLimit(uint8 fee, uint8 limit);
    error ReflectToken__AlreadyExcluded(address user);
    error ReflectToken__AlreadyIncluded(address user);
    error ReflectToken__CannotExcludeTotalSupply();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /// @notice Initializes token parameters.
    /// @param _name token name.
    /// @param _symbol token symbol.
    /// @param _supply total token supply.
    /// @param _limit caps number of tokens to be purchased per request.
    /// @param _feeReflect percentage to be reflected per transaction.
    /// @param _price to be paid in DemoToken to get new tokens.
    /// @param _token contract to be used to purchase new tokens.
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _supply,
        uint256 _limit,
        uint8 _feeReflect,
        uint256 _price,
        DemoToken _token
    ) 
    ERC20(_name, _symbol) 
    Ownable(msg.sender)
    {
        s_tTotal = _supply;
        s_rTotal = (~uint256(0) - (~uint256(0) % s_tTotal));
        s_feeReflectPct = _feeReflect;
        s_limit = _limit;
        s_tOwned[address(this)] = s_tTotal;
        s_rOwned[address(this)] = s_rTotal;
        s_purchaseToken = _token;
        s_price = _price;
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

    /// @notice Changes the reflection fee percentages to be deducted from {SELL} transaction type.
    /// @param _fee is the new reflection fee percentage.
    function setReflectFees(uint8 _fee) external onlyOwner {
        if(_fee >= 100) revert ReflectToken__FeeExceedLimit(_fee, 100);

        uint8 oldFee = s_feeReflectPct;
        s_feeReflectPct = _fee;

        emit FeeChanged(oldFee, _fee);
    }

    /// @notice Removes address from receiving future reflection distributions.
    /// @param _account to be excluded from reflections.
    function excludeAccount(address _account) external onlyOwner {
        if(s_isExcluded[_account]) revert ReflectToken__AlreadyExcluded(_account);
        if(balanceOf(_account) >= s_tTotal) revert ReflectToken__CannotExcludeTotalSupply();

        s_tOwned[_account] = balanceOf(_account);
        s_excluded.push(_account);
        s_isExcluded[_account] = true;
        emit AccountExcluded(_account);
    }

    /// @notice Includes previously excluded address to receive reflection distributions in case of erroneously
    /// @notice excluded address. NOTE: Included address will receive all previous reflection distribution it should
    /// @notice have received while address was excluded.
    /// @param _account to be re-included to reflections.
    function includeAccount(address _account) external onlyOwner {
        if(!s_isExcluded[_account]) revert ReflectToken__AlreadyIncluded(_account);

        for (uint256 i = 0; i < s_excluded.length; i++) {
            if (s_excluded[i] == _account) {
                s_excluded[i] = s_excluded[s_excluded.length - 1];
                s_excluded.pop();
                s_isExcluded[_account] = false;
                break;
            }
        }

        emit AccountIncluded(_account);
    }

    /// @notice Purchases new tokens within the limit
    /// @param _amount number of tokens to be purchased.
    function purchaseTokens(uint256 _amount) external {
        if(_amount > s_limit) revert ReflectToken__LimitExceeded(_amount, s_limit);
        uint256 balance = balanceOf(address(this));
        if(_amount > balance) revert ReflectToken__InsufficientFunds(_amount, balance);

        uint256 requiredTokens = (_amount / 1e18) * s_price;
        s_purchaseToken.burnFrom(msg.sender, requiredTokens);
        _transfer(address(this), msg.sender, _amount);
    }

    /// @notice Returns price per token in DemoTokens.
    function purchasePrice() public view returns (uint256) {
        return s_price;
    }

    /// @notice Returns remaining balance available for purchase.
    /// @dev Contract funds will self-replenish as it receive reflections.
    function remainingBalance() public view returns (uint256) {
        return balanceOf(address(this));
    }

    /// @notice See {IERC20-totalSupply}.
    /// @dev Overrides ERC20 totalSupply function.
    function totalSupply() public view override returns (uint256) {
        return s_tTotal;
    }

    /// @notice See {IERC20-balanceOf}.
    /// @dev Overrides ERC20 balanceOf function. If account is excluded then
    /// @dev tOwned balance is returned since that tracks token balance without
    /// @dev reflections. Otherwise, rOwned balance is returned after scaling down
    /// @dev by reflection rate.
    /// @param _account address to be checked for token balance.
    function balanceOf(address _account) public view override returns (uint256) {
        if (s_isExcluded[_account]) return s_tOwned[_account];
        return tokenFromReflection(s_rOwned[_account]);
    }

    /// @notice Provides scaled down amount based on current reflection rate.
    /// @dev Helper function for balanceOf function. Scales down a given amount, incl. of reflections, by reflect rate.
    /// @param _rAmount amount to be scaled down by reflection rate.
    function tokenFromReflection(uint256 _rAmount) public view returns (uint256) {
        if(_rAmount > s_rTotal) revert ReflectToken__LimitExceeded(_rAmount, s_rTotal);
        uint256 currentRate = _getRate();
        return _rAmount / currentRate;
    }

    /// @notice Allows checking whether an account has been excluded from receiving reflection distributions.
    /// @param _account address to be checked if excluded from reflections.
    function isExcludedAct(address _account) public view returns (bool) {
        return s_isExcluded[_account];
    }

    /// @notice Allows to view total amount of reflection fees collected since
    /// @notice contract creation.
    function totalFees() public view returns (uint256) {
        return s_tFeeTotal;
    }

    /// @notice See {IERC20-transfer}.
    /// @dev Overrides ERC20 _transfer function. Requires 'sender' and
    /// @dev 'recipient' to be non-zero address to prevent minting/burning and
    /// @dev non-zero transfer amount. Function determines transaction type 'BUY',
    /// @dev 'SELL', or 'NONE' depending on whether sender or recipient is exchange
    /// @dev pair address. Actual token transfer is delegated to {_transferStandard}.
    /// @dev Function is pausable by token administrator.
    /// @param _sender address sending token.
    /// @param _recipient address receiving token.
    /// @param _amount number of tokens being transferred.
    function _transfer(address _sender,address _recipient,uint256 _amount) internal override whenNotPaused {
        if(_sender == address(0)) revert ERC20InvalidSender(address(0));
        if(_recipient == address(0)) revert ERC20InvalidReceiver(address(0));
        require(
            _amount > 0,
            "ERC20: transfer amount must be greater than zero"
        );
        uint256 senderBalance = balanceOf(_sender);
        if(senderBalance < _amount) revert ERC20InsufficientBalance(_sender, senderBalance, _amount);

        _transferStandard(_sender, _recipient, _amount);
    }

    /// @dev Updates rOwned and tOwned balances after deducting applicable
    /// @dev transaction fees and allocates fees to marketing and acquisition
    /// @dev wallets. {_getValues} helper function calculates all relevant amounts.
    /// @dev Emits a {Transfer} event after the balances have been updated.
    /// @param _sender is address sending token.
    /// @param _recipient is address receiving token.
    /// @param _tAmount is number of tokens being transferred.
    function _transferStandard(address _sender, address _recipient, uint256 _tAmount) private {
        (FeeValues memory tValues, FeeValues memory rValues) = _getValues(_tAmount);

        if (s_isExcluded[_sender]) {
            s_tOwned[_sender] -= tValues.Amount;
            s_rOwned[_sender] -= rValues.Amount;
        } else {
            s_rOwned[_sender] -= rValues.Amount;
        }

        if (s_isExcluded[_recipient]) {
            s_tOwned[_recipient] += tValues.TransferAmount;
            s_rOwned[_recipient] += rValues.TransferAmount;
        } else {
            s_rOwned[_recipient] += rValues.TransferAmount;
        }

        _reflectFee(rValues.ReflectFee, tValues.ReflectFee);
        emit Transfer(_sender, _recipient, tValues.TransferAmount);
    }

    /// @dev Updates {rTotal} supply by subtracting reflection fees. Updates {tFeeTotal} to add reflection fees. 
    /// @dev This is used to update the reflection rate to calculate users' balances included in reflection.
    /// @param _rFee Scaled up reflection fees from transaction
    /// @param _tFee Actual reflection fees from transaction
    function _reflectFee(uint256 _rFee, uint256 _tFee) private {
        s_rTotal = s_rTotal - _rFee;
        s_tFeeTotal = s_tFeeTotal + _tFee;
    }

    /// @dev Calculates the required fees to be deducted for given transaction amount and transaction type.
    /// @param _tAmount amount being transferred by user.
    function _getValues(uint256 _tAmount) private view returns (FeeValues memory, FeeValues memory) {
        uint256 currentRate = _getRate();
        FeeValues memory tValues = _getTValues(_tAmount);
        FeeValues memory rValues = _getRValues(tValues, currentRate);

        return (tValues, rValues);
    }

    /// @dev Calculates the actual reflection fees to be deducted from the transfer amount.
    /// @param _tAmount amount being transferred by user.
    function _getTValues(uint256 _tAmount) private view returns (FeeValues memory) {
        FeeValues memory tValues;
        tValues.Amount = _tAmount;
        tValues.ReflectFee = (_tAmount * s_feeReflectPct) / 100;
        tValues.TransferAmount = tValues.Amount - tValues.ReflectFee;

        return (tValues);
    }

    /// @dev Calculates the reflect rate based on rSupply and rSupply. As reflection fees are deducted from rSupply by
    /// @dev {reflectFee} function, the reflection rate will decrease, causing users' balances to increase by the
    /// @dev reflection fee in proportion to the user's balance / total supply
    function _getRate() private view returns (uint256) {
        (uint256 rSupply, uint256 tSupply) = _getCurrentSupply();
        return rSupply / tSupply;
    }

    /// @dev Calculates the scaled up and actual token supply excl. of excluded addresses. This impacts the reflection
    /// @dev rate to allow incl. addresses to receive reflects that would have gone to excl. accounts.
    function _getCurrentSupply() private view returns (uint256, uint256) {
        uint256 rSupply = s_rTotal;
        uint256 tSupply = s_tTotal;
        for (uint256 i = 0; i < s_excluded.length; i++) {
            if (s_rOwned[s_excluded[i]] > rSupply || s_tOwned[s_excluded[i]] > tSupply)
                return (s_rTotal, s_tTotal);

            rSupply = rSupply - s_rOwned[s_excluded[i]];
            tSupply = tSupply - s_tOwned[s_excluded[i]];
        }
        if (rSupply < s_rTotal / s_tTotal) return (s_rTotal, s_tTotal);
        return (rSupply, tSupply);
    }

    /// @dev Scales up transaction fees {tValues} by reflection rate to allow proper update of rOwned user balance.
    /// @param _tValues actual transfer amount and fees to be deducted.
    /// @param _currentRate current reflection rate.
    function _getRValues(FeeValues memory _tValues, uint256 _currentRate) private pure returns (FeeValues memory) {
        FeeValues memory rValues;
        rValues.Amount = _tValues.Amount * _currentRate;
        rValues.ReflectFee = _tValues.ReflectFee * _currentRate;
        rValues.TransferAmount = rValues.Amount - rValues.ReflectFee;

        return (rValues);
    }
}
