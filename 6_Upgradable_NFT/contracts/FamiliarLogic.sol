// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import "./ERC721/ERC721.sol";
import "./CommonStorage.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./IInitializable.sol";
import "./Library/Bytes.sol";

/// @title FamiliarLogic
/// @notice Contract implementation for NFT users
/// @dev Logic implementation or base contracts other 
/// @dev than CommonStorage must not declare any state variables
contract FamiliarLogic is CommonStorage, ERC165, ERC721, IInitializable {
    using Bytes for bytes;

     /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC165) returns (bool) {
        return
            interfaceId == type(IInitializable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function getTokenBlueprint(uint256 tokenId) external view returns (string memory) {
        return string(blueprints[tokenId]); 
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory familiarId = blueprints[tokenId].substring(0,4);
        string memory baseURI = _baseURI();

        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, familiarId, ".png")) : "";
    }

    function _baseURI() internal view override returns (string memory) {
        return rootURI;
    }
    
    function init(bytes[] calldata _data) external {
        require(initializing, "FamiliarLogic: Unauthorized initialization");
        names = string(_data[1]);
        symbols = string(_data[2]);
        rootURI = string(_data[3]);
    }
}