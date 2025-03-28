// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {IERC2981, ERC2981} from "./ERC2981/ERC2981.sol";
import {IERC165, ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title FamiliarAdmin
/// @author Rafael Mendoza
/// @notice NFT implementation-specific restricted functions
/// @dev Logic implementation or base contracts other than CommonStorage must not declare any state variables
contract FamiliarAdmin is ERC2981 {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    event RoyaltyUpdated(address indexed beneficiary, uint96 fee, uint256 tokenId);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /// @notice Sets default royalty information for all tokens
    /// @param _receiver address of royalty beneficiary. Cannot be address 0
    /// @param _feeNumerator percentage of sales price to be paid, in basis points
    function setDefaultRoyalty(address _receiver, uint96 _feeNumerator) external {
        _setDefaultRoyalty(_receiver, _feeNumerator);
        
        emit RoyaltyUpdated(_receiver, _feeNumerator, 0);
    }

    /// @notice Sets specific royalty information for a specific token ID
    /// @param _tokenId id of token to apply royalty information
    /// @param _receiver royalty beneficiary. Cannot be address 0
    /// @param _feeNumerator percentage of sales price to be paid, in basis points
    function setTokenRoyalty(uint256 _tokenId, address _receiver, uint96 _feeNumerator) external {
        _setTokenRoyalty(_tokenId, _receiver, _feeNumerator);
        
        emit RoyaltyUpdated(_receiver, _feeNumerator, _tokenId);
    }

    /// @notice deletes default royalty information.
    function deleteDefaultRoyalty() external {
        _deleteDefaultRoyalty();
        
        emit RoyaltyUpdated(address(0), 0, 0);
    }

    /// @notice deletes royalty information for specific token Id.
    /// @param _tokenId ID of token to delete royalty information
    function resetTokenRoyalty(uint256 _tokenId) external {
        _resetTokenRoyalty(_tokenId);
        RoyaltyInfo memory royalty = s_defaultRoyaltyInfo_;
        
        emit RoyaltyUpdated(royalty.receiver, royalty.royaltyFraction, _tokenId);
    }       

     /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return
            interfaceId == type(IERC2981).interfaceId;
    } 
}