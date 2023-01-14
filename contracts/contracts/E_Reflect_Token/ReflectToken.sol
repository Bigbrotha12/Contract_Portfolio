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
        uint256 MarketingFee;
        uint256 AcquisitionFee;
    }

    enum MarketSide {
        NONE,
        BUY,
        SELL
    }

    //------------------ STATE VARIABLES ---------------------------------------

    mapping(address => uint256) private rOwned;
    mapping(address => uint256) private tOwned;
    mapping(address => bool) private isExcluded;
    address[] private excluded;
    uint256 private tTotal;
    uint256 private rTotal;
    uint256 private tFeeTotal;

    address private marketingWallet;
    address[5] private acquisitionWallets;
    mapping(address => bool) private isExchange;

    uint8 private buyFeeReflect;
    uint8 private buyFeeMarketing;
    uint8 private buyFeeAcquisition;
    uint8 private sellFeeReflect;
    uint8 private sellFeeMarketing;
    uint8 private sellFeeAcquisition;

    //--------------------  CONSTRUCTOR ----------------------------------------

    /// @notice Sets the values for name, symbol, totalSupply, marketingWallet,
    /// @notice and acquisitionWallets. Initial allocation: 95% to Admin account (for
    /// @notice liquidity), 2% to Marketing wallet, 3% to Acquisition wallets.
    /// @param _name               token name.
    /// @param _symbol             token symbol.
    /// @param _supply             total token supply.
    /// @param _marketing          inital marketing wallet address.
    /// @param _acquisition        list of initial 5 acquisition wallet addresses.
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _supply,
        address _marketing,
        address[] memory _acquisition
    ) ERC20(_name, _symbol) {
        tTotal = _supply * 10 ** 4;
        rTotal = (~uint256(0) - (~uint256(0) % tTotal));
        buyFeeReflect = 1;
        buyFeeMarketing = 1;
        buyFeeAcquisition = 7;
        sellFeeReflect = 5;
        sellFeeMarketing = 1;
        sellFeeAcquisition = 3;
        marketingWallet = _marketing;
        for (uint i = 0; i < acquisitionWallets.length; i++) {
            acquisitionWallets[i] = _acquisition[i];
        }

        tOwned[_msgSender()] += (tTotal * 95) / 100;
        rOwned[_msgSender()] += (rTotal / 100) * 95;
        emit Transfer(address(0), _msgSender(), tOwned[_msgSender()]);

        tOwned[marketingWallet] += (tTotal * 2) / 100;
        rOwned[marketingWallet] += (rTotal / 100) * 2;
        emit Transfer(address(0), marketingWallet, (tTotal * 2) / 100);

        for (uint i = 0; i < acquisitionWallets.length; i++) {
            tOwned[acquisitionWallets[i]] +=
                (tTotal * 3) /
                100 /
                acquisitionWallets.length;
            rOwned[acquisitionWallets[i]] +=
                ((rTotal / 100) * 3) /
                acquisitionWallets.length;

            emit Transfer(
                address(0),
                acquisitionWallets[i],
                (tTotal * 3) / 100 / acquisitionWallets.length
            );
        }
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
        return 4;
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

    /// @notice Returns which address is receiving marketing fees
    /// @notice from 'BUY' / 'SELL' transactions.
    function getMarketingWallet() public view returns (address) {
        return marketingWallet;
    }

    /// @notice Returns which address is receiving acquisition fees
    /// @notice from 'BUY' / 'SELL' transactions at a given index.
    /// @param _index                number between 0 - 4 representing wallets 1 through 5.
    function getAcquisitionWallet(
        uint256 _index
    ) public view returns (address) {
        require(_index < acquisitionWallets.length, "Invalid index");
        return acquisitionWallets[_index];
    }

    /// @notice Allows to view total amount of reflection fees collected since
    /// @notice contract creation.
    function totalFees() public view returns (uint256) {
        return tFeeTotal;
    }

    /// @dev Calculates the required fees to be deducted for given transaction
    /// @dev amount and transaction type.
    /// @param _tAmount              amount being transferred by user.
    /// @param _side                 transaction type: {BUY}, {SELL}, {NONE}.
    function _getValues(
        uint256 _tAmount,
        MarketSide _side
    ) private view returns (FeeValues memory, FeeValues memory) {
        uint256 currentRate = _getRate();
        FeeValues memory tValues = _getTValues(_tAmount, _side);
        FeeValues memory rValues = _getRValues(tValues, currentRate);

        return (tValues, rValues);
    }

    /// @dev Function call {_getFeeValues} to obtain the relevant fee
    /// @dev percentage for the {_side} transaction type. Calculates the actual
    /// @dev marketing, acquistion, and reflection fees to be deducted from the
    /// @dev transfer amount.
    /// @param _tAmount            amount being transferred by user.
    /// @param _side               transaction type: 'BUY', 'SELL', 'NONE'.
    function _getTValues(
        uint256 _tAmount,
        MarketSide _side
    ) private view returns (FeeValues memory) {
        (
            uint8 feeReflect,
            uint8 feeMarketing,
            uint8 feeAcquisition
        ) = _getFeeValues(_side);

        FeeValues memory tValues;
        tValues.Amount = _tAmount;
        tValues.ReflectFee = (_tAmount * feeReflect) / 100;
        tValues.MarketingFee = (_tAmount * feeMarketing) / 100;
        tValues.AcquisitionFee = (_tAmount * feeAcquisition) / 100;
        tValues.TransferAmount =
            tValues.Amount -
            tValues.ReflectFee -
            tValues.MarketingFee -
            tValues.AcquisitionFee;

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
        rValues.MarketingFee = _tValues.MarketingFee * _currentRate;
        rValues.AcquisitionFee = _tValues.AcquisitionFee * _currentRate;
        rValues.TransferAmount =
            rValues.Amount -
            rValues.ReflectFee -
            rValues.MarketingFee -
            rValues.AcquisitionFee;

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

    /// @dev Calculates the transaction fee percentages depending on whether
    /// @dev user is buying, selling, or transferring the token.
    /// @param _side               transaction type: 'BUY', 'SELL', 'NONE'.
    function _getFeeValues(
        MarketSide _side
    ) private view returns (uint8, uint8, uint8) {
        if (_side == MarketSide.BUY) {
            return (buyFeeReflect, buyFeeMarketing, buyFeeAcquisition);
        } else if (_side == MarketSide.SELL) {
            return (sellFeeReflect, sellFeeMarketing, sellFeeAcquisition);
        } else {
            return (0, 0, 0);
        }
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

        MarketSide side;
        if (isExchange[_sender]) {
            side = MarketSide.BUY;
        } else if (isExchange[_recipient]) {
            side = MarketSide.SELL;
        } else {
            side = MarketSide.NONE;
        }

        _transferStandard(_sender, _recipient, _amount, side);
    }

    /// @dev Updates rOwned and tOwned balances after deducting applicable
    /// @dev transaction fees and allocates fees to marketing and acquisition
    /// @dev wallets. {_getValues} helper function calculates all relevant amounts.
    /// @dev Emits a {Transfer} event after the balances have been updated.
    /// @param _sender is address sending token.
    /// @param _recipient is address receiving token.
    /// @param _tAmount is number of tokens being transferred.
    /// @param _side is transaction type: 'BUY', 'SELL', 'NONE'.
    function _transferStandard(
        address _sender,
        address _recipient,
        uint256 _tAmount,
        MarketSide _side
    ) private {
        (FeeValues memory tValues, FeeValues memory rValues) = _getValues(
            _tAmount,
            _side
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

        emit Transfer(_sender, _recipient, tValues.TransferAmount);

        if (_side != MarketSide.NONE) {
            reflectFee(rValues.ReflectFee, tValues.ReflectFee);
            if (tValues.MarketingFee > 0) {
                if (isExcluded[marketingWallet]) {
                    tOwned[marketingWallet] += tValues.MarketingFee;
                    rOwned[marketingWallet] += rValues.MarketingFee;
                } else {
                    rOwned[marketingWallet] += rValues.MarketingFee;
                }
                emit Transfer(_sender, marketingWallet, tValues.MarketingFee);
            }

            if (tValues.AcquisitionFee > 0) {
                _acquisitionWalletAlloc(
                    _sender,
                    tValues.AcquisitionFee,
                    rValues.AcquisitionFee
                );
            }
        }
    }

    /// @dev Allocates the acquisition wallet fees to each of the five
    /// @dev acquisition addresses in equal proportion.
    /// @param _sender              address sending token.
    /// @param _tAmount             amount of tokens to be allocated.
    /// @param _rAmount             scaled up amount to be allocated.
    function _acquisitionWalletAlloc(
        address _sender,
        uint256 _tAmount,
        uint256 _rAmount
    ) private {
        uint256 _tAllocation = _tAmount / acquisitionWallets.length;
        uint256 _rAllocation = _rAmount / acquisitionWallets.length;

        for (uint i = 0; i < acquisitionWallets.length; i++) {
            if (isExcluded[acquisitionWallets[i]]) {
                tOwned[acquisitionWallets[i]] += _tAllocation;
                rOwned[acquisitionWallets[i]] += _rAllocation;
            } else {
                rOwned[acquisitionWallets[i]] += _rAllocation;
            }
            emit Transfer(_sender, acquisitionWallets[i], _tAllocation);
        }
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

    /// @notice Sets the exchange pair address for the token to detect 'BUY',
    /// @notice 'SELL', or 'NONE' transactions for fee collection.
    /// @dev Only transactions to, and from this address will trigger fee collection.
    /// @param _exchangePair         DEX liquidity pool
    function setExchange(address _exchangePair) external onlyOwner {
        require(
            !isExchange[_exchangePair],
            "FeeOnTransfer: Address already Exchange"
        );
        isExchange[_exchangePair] = true;
    }

    /// @notice Removes an exchange pair address from fee collection.
    /// @param _exchangePair         DEX liquidity pool
    function removeExchange(address _exchangePair) external onlyOwner {
        require(
            isExchange[_exchangePair],
            "FeeOnTransfer: Address not Exchange"
        );
        isExchange[_exchangePair] = false;
    }

    /// @notice Changes marketing wallet address to receive marketing fee going
    /// @notice forward.
    /// @param _newAddress          new address marketing addresses.
    function changeMarketing(address _newAddress) external onlyOwner {
        require(
            _newAddress != address(0),
            "FeeOnTransfer: Address cannot be zero address"
        );
        marketingWallet = _newAddress;
    }

    /// @notice Changes acquisition wallets address to receive acquisition fee
    /// @notice going forward.
    /// @param _index                wallet index to be replaced, from 0 to 4.
    /// @param _newAddress           new acquisition wallet address.
    function changeAcquisition(
        uint256 _index,
        address _newAddress
    ) external onlyOwner {
        require(
            _index < acquisitionWallets.length,
            "FeeOnTransfer: Invalid index value"
        );
        require(
            _newAddress != address(0),
            "FeeOnTransfer: Address cannot be zero address"
        );
        acquisitionWallets[_index] = _newAddress;
    }

    /// @notice Changes the reflection, marketing, and acquisition fee
    /// @notice percentages to be deducted from 'BUY' transaction type.
    /// @param _reflectFee           new reflection fee percent.
    /// @param _marketingFee         new marketing fee percent.
    /// @param _acquisitionFee       new acquisition fee percent.
    function setBuyFees(
        uint8 _reflectFee,
        uint8 _marketingFee,
        uint8 _acquisitionFee
    ) external onlyOwner {
        require(
            _reflectFee + _marketingFee + _acquisitionFee < 100,
            "FeeOnTransfer: Total fee percentage must be less than 100%"
        );

        buyFeeReflect = _reflectFee;
        buyFeeMarketing = _marketingFee;
        buyFeeAcquisition = _acquisitionFee;
    }

    /// @notice Changes the reflection, marketing, and acquisition fee
    /// @notice percentages to be deducted from {SELL} transaction type.
    /// @param _reflectFees is the new reflection fee percentage.
    /// @param _marketingFees is the new marketing fee percentage.
    /// @param _acquisitionFees is the new acquisition fee percentage.
    function setSellFees(
        uint8 _reflectFees,
        uint8 _marketingFees,
        uint8 _acquisitionFees
    ) external onlyOwner {
        require(
            _reflectFees + _marketingFees + _acquisitionFees < 100,
            "FeeOnTransfer: Total fee percentage must be less than 100%"
        );

        sellFeeReflect = _reflectFees;
        sellFeeMarketing = _marketingFees;
        sellFeeAcquisition = _acquisitionFees;
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
