// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import {IERC165, ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {CommonStorage} from "../CommonStorage.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @dev Implementation of the NFT Royalty Standard, a standardized way to retrieve royalty payment information.
 *
 * Royalty information can be specified globally for all token ids via {_setDefaultRoyalty}, and/or individually for
 * specific token ids via {_setTokenRoyalty}. The latter takes precedence over the first.
 *
 * Royalty is specified as a fraction of sale price. {_feeDenominator} is overridable but defaults to 10000, meaning the
 * fee is specified in basis points by default.
 *
 * IMPORTANT: ERC-2981 only specifies a way to signal royalty information and does not enforce its payment. See
 * https://eips.ethereum.org/EIPS/eip-2981#optional-royalty-payments[Rationale] in the ERC. Marketplaces are expected to
 * voluntarily pay royalties together with sales, but note that this standard is not yet widely supported.
 * NOTE: Moved all storage variable to CommonStorage
 */
abstract contract ERC2981 is IERC2981, ERC165, CommonStorage {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 ERRORS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @dev The default royalty set is invalid (eg. (numerator / denominator) >= 1).
     */
    error ERC2981InvalidDefaultRoyalty(uint256 numerator, uint256 denominator);

    /**
     * @dev The default royalty receiver is invalid.
     */
    error ERC2981InvalidDefaultRoyaltyReceiver(address receiver);

    /**
     * @dev The royalty set for an specific `tokenId` is invalid (eg. (numerator / denominator) >= 1).
     */
    error ERC2981InvalidTokenRoyalty(uint256 tokenId, uint256 numerator, uint256 denominator);

    /**
     * @dev The royalty receiver for `tokenId` is invalid.
     */
    error ERC2981InvalidTokenRoyaltyReceiver(uint256 tokenId, address receiver);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 _interfaceId) public view virtual override(IERC165, ERC165) returns (bool) {
        return _interfaceId == type(IERC2981).interfaceId || super.supportsInterface(_interfaceId);
    }

    /**
     * @inheritdoc IERC2981
     */
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) public view virtual returns (address, uint256) {
        RoyaltyInfo storage s_royaltyInfo_ = s_tokenRoyaltyInfo_[_tokenId];
        address royaltyReceiver = s_royaltyInfo_.receiver;
        uint96 royaltyFraction = s_royaltyInfo_.royaltyFraction;

        if (royaltyReceiver == address(0)) {
            royaltyReceiver = s_defaultRoyaltyInfo_.receiver;
            royaltyFraction = s_defaultRoyaltyInfo_.royaltyFraction;
        }

        uint256 royaltyAmount = (_salePrice * royaltyFraction) / _feeDenominator();

        return (royaltyReceiver, royaltyAmount);
    }

    /**
     * @dev Sets the royalty information that all ids in this contract will default to.
     *
     * Requirements:
     *
     * - `receiver` cannot be the zero address.
     * - `feeNumerator` cannot be greater than the fee denominator.
     */
    function _setDefaultRoyalty(address _receiver, uint96 _feeNumerator) internal virtual {
        uint256 denominator = _feeDenominator();
        if (_feeNumerator > denominator) {
            // Royalty fee will exceed the sale price
            revert ERC2981InvalidDefaultRoyalty(_feeNumerator, denominator);
        }
        if (_receiver == address(0)) revert ERC2981InvalidDefaultRoyaltyReceiver(address(0));
        
        s_defaultRoyaltyInfo_ = RoyaltyInfo(_receiver, _feeNumerator);
    }

    /**
     * @dev Removes default royalty information.
     */
    function _deleteDefaultRoyalty() internal virtual {
        delete s_defaultRoyaltyInfo_;
    }

    /**
     * @dev Sets the royalty information for a specific token id, overriding the global default.
     *
     * Requirements:
     *
     * - `receiver` cannot be the zero address.
     * - `feeNumerator` cannot be greater than the fee denominator.
     */
    function _setTokenRoyalty(uint256 _tokenId, address _receiver, uint96 _feeNumerator) internal virtual {
        uint256 denominator = _feeDenominator();
        if (_feeNumerator > denominator) {
            // Royalty fee will exceed the sale price
            revert ERC2981InvalidTokenRoyalty(_tokenId, _feeNumerator, denominator);
        }
        if (_receiver == address(0)) {
            revert ERC2981InvalidTokenRoyaltyReceiver(_tokenId, address(0));
        }

        s_tokenRoyaltyInfo_[_tokenId] = RoyaltyInfo(_receiver, _feeNumerator);
    }

    /**
     * @dev Resets royalty information for the token id back to the global default.
     */
    function _resetTokenRoyalty(uint256 _tokenId) internal virtual {
        delete s_tokenRoyaltyInfo_[_tokenId];
    }

    /**
     * @dev The denominator with which to interpret the fee set in {_setTokenRoyalty} and {_setDefaultRoyalty} as a
     * fraction of the sale price. Defaults to 10000 so fees are expressed in basis points, but may be customized by an
     * override.
     */
    function _feeDenominator() internal pure virtual returns (uint96) {
        return 10000;
    }
}