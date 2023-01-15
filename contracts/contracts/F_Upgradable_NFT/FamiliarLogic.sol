// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.9;

import "./ERC721/ERC721.sol";
import "./ERC2981/ERC2981.sol";
import "./CommonStorage.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./IInitializable.sol";
import "./Library/Bytes.sol";

/// @title FamiliarLogic
/// @notice Contract implementation for NFT users
/// @dev Logic implementation or base contracts other 
/// @dev than CommonStorage must not declare any state variables
contract FamiliarLogic is CommonStorage, ERC165, ERC721, ERC2981, IInitializable {
    using Bytes for bytes;

    //----------------------- VIEW FUNCTIONS -----------------------------------

     /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IInitializable).interfaceId ||
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /// @notice Returns the NFT data associated with given token ID
    /// @param _tokenId     of token data being queried.
    function getTokenBlueprint(uint256 _tokenId) external view returns (string memory) {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");

        return string(blueprints[_tokenId]); 
    }

    /// @notice Returns URI of given token's image data
    /// @param _tokenId     of token data being queried.
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory familiarId = blueprints[_tokenId].substring(0,4);
        string memory baseURI = _baseURI();

        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, "/Images/", familiarId, ".png")) : "";
    }

    function _baseURI() internal view override returns (string memory) {
        return rootURI;
    }

    //-------------------- MUTATIVE FUNCTIONS ----------------------------------
    
    /// @notice Allows initialization of NFT core data by proxy upgrader.
    /// @dev Only callable from within proxy's upgradeAndInit function and only once.
    /// @param _data    received from proxy upgrade function
    function init(bytes[] calldata _data) external {
        require(initializing, "FamiliarLogic: Unauthorized initialization");
        names = string(_data[1]);
        symbols = string(_data[2]);
        rootURI = string(_data[3]);
    }
}