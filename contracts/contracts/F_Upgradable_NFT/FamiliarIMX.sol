// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.9;

import "./ERC721/ERC721.sol";
import "./CommonStorage.sol";
import "./IMXBridge/Mintable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/// @title Familiar Logic Implementation
/// @notice NFT contract implementation for IMX minting
/// @dev Logic implementation or base contracts other 
/// @dev than CommonStorage must not declare any state variables
contract FamiliarIMX is CommonStorage, ERC165, ERC721, Mintable {

    //----------------------- VIEW FUNCTIONS -----------------------------------

     /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC165) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IMintable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    //-------------------- MUTATIVE FUNCTIONS ----------------------------------

    function _mintFor(address _to, uint256 _id, bytes memory _blueprint) internal override {
        blueprints[_id] = _blueprint;
        _safeMint(_to, _id);
    }
}