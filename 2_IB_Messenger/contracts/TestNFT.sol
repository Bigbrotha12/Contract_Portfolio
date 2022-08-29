// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestNFT is ERC721 {

    address public IBC_ENDPOINT;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) { 
    }

    function initEndpoint(address _ibc) external {
        IBC_ENDPOINT = _ibc;
    }

    function mint(address to, uint256 tokenId) external {
        require(msg.sender == IBC_ENDPOINT, "TestNFT: Unauthorized");
        _mint(to, tokenId);
    }

    function burn(uint256 tokenId) external {
        require(msg.sender == IBC_ENDPOINT, "TestNFT: Unauthorized");
        _burn(tokenId);
    }
}