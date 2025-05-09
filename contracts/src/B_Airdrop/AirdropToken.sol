// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title AirdropToken
/// @author Rafael Mendoza
/// @notice Simple ERC20 token with default functionality
contract AirdropToken is ERC20 {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /// @notice Creates a new ERC20 token contract
    /// @param _name name of token
    /// @param _symbol symbol of token
    /// @param _amount number of tokens to be created
    constructor(string memory _name, string memory _symbol, uint256 _amount) ERC20(_name, _symbol){
        _mint(msg.sender, _amount);
    }
}