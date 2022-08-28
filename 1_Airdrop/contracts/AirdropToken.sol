// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title AirdropToken
/// @notice Simple ERC20 token with default functionality
contract AirdropToken is ERC20 {

    /// @notice Creates a new ERC20 token contract
    /// @param _name of token
    /// @param _symbol of token
    /// @param _amount of tokens to be created
    constructor(string memory _name, string memory _symbol, uint256 _amount) ERC20(_name, _symbol){
        _mint(msg.sender, _amount);
    }

}