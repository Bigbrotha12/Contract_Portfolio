// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "Contract_Portfolio/node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "Contract_Portfolio/node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CommonStorage.sol";

/// @title Familiar Implementation
/// @notice NFT contract implementation
contract FamiliarImpl is CommonStorage, ERC721 {
    using Strings for uint256;
    using Bytes for bytes;

    function init(bytes[] calldata initData_) external onlyOwner {
        _name = string(initData_[1]);
        _symbol = string(initData_[2]);
        _rootURI = string(initData_[3]);
    }

    function getTokenBlueprint(uint256 tokenId_) external view returns (string memory) {
        return string(_blueprints[tokenId_]); 
    }

    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory familiarId = _blueprints[tokenId].substring(0,4);
        string memory baseURI = _baseURI();

        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, familiarId, ".png")) : "";
    }

    function changeBlueprint(uint256 tokenId_, bytes calldata newBlueprint_) external onlyOwner {
        _blueprints[tokenId_] = newBlueprint_;
    }

    function _baseURI() internal view override returns (string memory) {
        return _rootURI;
    }

    function _mintFor(address to, uint256 id, bytes memory blueprint) internal override {
        /* IMX Blueprint will contain four-characters, left-padded variables
         * Format: VVVVWWWWXXXXYYYYZZZZ where VVVV = familiarId, WWWW = move1, 
         * XXXX = move2, YYYY = move3, and ZZZZ = move4
         */
        _mint(to, id);
        _blueprints[id] = blueprint;
    }
}