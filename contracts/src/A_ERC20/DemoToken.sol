// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title DemoToken
/// @author Rafael Mendoza
/// @notice Simple ERC20 token with default functionality for use with portfolio contracts.
contract DemoToken is ERC20 {
    
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    address public s_owner;
    mapping(address minter => bool status) public s_whitelist;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    event MinterChanged(address indexed minter, bool newStatus);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 ERRORS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    error DemoToken__Unauthorized(address unauthorized);
    error DemoToken__NotMinter(address unauthorized);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                MODIFIERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    modifier Minter {
        if(!isMinter(msg.sender)) {
            revert DemoToken__NotMinter(msg.sender);
        }
        _;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /// @notice Creates a new ERC20 token contract for use with demonstration contracts
    /// @param _name name of token
    /// @param _symbol symbol of token
    /// @param _whitelist address array of demo contracts who can mint/burn tokens
    constructor(string memory _name, string memory _symbol, address[] memory _whitelist)
        ERC20(_name, _symbol) 
    {
        s_owner = msg.sender;
        for (uint256 index = 0; index < _whitelist.length; index++) {
            s_whitelist[_whitelist[index]] = true;
        }
    }

    /// @notice Changes list of addresses allowed to mint new tokens.
    /// @param _minter address to be updated.
    /// @param _active permission to be given (true) or taken away (false).
    function changeMinter(address _minter, bool _active) external {
        if(msg.sender != s_owner) {
            revert DemoToken__Unauthorized(msg.sender);
        }
        s_whitelist[_minter] = _active;

        emit MinterChanged(_minter, _active);
    }

    /// @notice Allows whitelisted addresses to mint new tokens.
    /// @param _recipient address to receive new tokens.
    /// @param _amount number of tokens to be minted.
    function mintTo(address _recipient, uint256 _amount) external Minter {
        _mint(_recipient, _amount);
    }

    /// @notice Allows whitelisted addresses to burn tokens from an address.
    /// @param _recipient address to receive new tokens.
    /// @param _amount of tokens to be minted.
    function burnFrom(address _recipient, uint256 _amount) external Minter {
        _burn(_recipient, _amount);
    }

    /// @notice Allows any addresses to obtain 10 tokens.
    /// @dev Function left open to facilitate demonstration of contract.
    function faucet() external {
        _mint(msg.sender, 10 ether);
    }

    /// @notice Checks whether given address is allowed to mint tokens.
    /// @param _requester address to be checked.
    function isMinter(address _requester) public view returns (bool) {
        return s_whitelist[_requester];
    }
}
