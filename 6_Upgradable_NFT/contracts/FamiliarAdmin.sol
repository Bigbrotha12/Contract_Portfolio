// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import "./ERC2981/ERC2981.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/// @title FamiliarAdmin
/// @notice NFT contract restricted functions access
/// @dev Logic implementation or base contracts other 
/// @dev than CommonStorage must not declare any state variables
contract FamiliarAdmin is ERC165, ERC2981 {

     /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function setDefaultRoyalty(address _receiver, uint96 _feeNumerator) external {
        _setDefaultRoyalty(_receiver, _feeNumerator);
    }

    function setTokenRoyalty(uint256 _tokenId, address _receiver, uint96 _feeNumerator) external {
        _setTokenRoyalty(_tokenId, _receiver, _feeNumerator);
    }

    function deleteDefaultRoyalty() external {
        _deleteDefaultRoyalty();
    }

    function resetTokenRoyalty(uint256 _tokenId) external {
        _resetTokenRoyalty(_tokenId);
    }

        
}