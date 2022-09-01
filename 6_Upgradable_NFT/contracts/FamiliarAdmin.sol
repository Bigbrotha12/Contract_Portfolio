// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import "./ERC2981/ERC2981.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/// @title FamiliarAdmin
/// @notice NFT implementation-specific restricted functions
/// @dev Logic implementation or base contracts other 
/// @dev than CommonStorage must not declare any state variables
contract FamiliarAdmin is ERC165, ERC2981 {

    //----------------------- VIEW FUNCTIONS -----------------------------------

     /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    //-------------------- MUTATIVE FUNCTIONS ----------------------------------

    /// @notice Sets default royalty information for all tokens
    /// @param _receiver        is royalty beneficiary. Cannot be address 0
    /// @param _feeNumerator    is percentage of sales price to be paid, in basis points
    function setDefaultRoyalty(address _receiver, uint96 _feeNumerator) external {
        _setDefaultRoyalty(_receiver, _feeNumerator);
    }

    /// @notice Sets specific royalty information for a specific token ID
    /// @param _tokenId         is id of token to apply royalty information
    /// @param _receiver        is royalty beneficiary. Cannot be address 0
    /// @param _feeNumerator    is percentage of sales price to be paid, in basis points
    function setTokenRoyalty(uint256 _tokenId, address _receiver, uint96 _feeNumerator) external {
        _setTokenRoyalty(_tokenId, _receiver, _feeNumerator);
    }

    /// @notice deletes default royalty information.
    function deleteDefaultRoyalty() external {
        _deleteDefaultRoyalty();
    }

    /// @notice deletes royalty information for specific token Id.
    /// @param _tokenId     of token to delete royalty information
    function resetTokenRoyalty(uint256 _tokenId) external {
        _resetTokenRoyalty(_tokenId);
    }        
}