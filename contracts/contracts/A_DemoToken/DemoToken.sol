// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title DemoToken
/// @notice Simple ERC20 token with default functionality
contract DemoToken is ERC20 {
    address public owner;
    mapping(address => bool) public whitelist;

    //--------------------  CONSTRUCTOR ----------------------------------------

    /// @notice Creates a new ERC20 token contract for use with demonstration contracts
    /// @param _name of token
    /// @param _symbol of token
    /// @param _whitelist of demo contracts who can mint/burn tokens
    constructor(
        string memory _name,
        string memory _symbol,
        address[] memory _whitelist
    ) ERC20(_name, _symbol) {
        owner = msg.sender;
        for (uint256 index = 0; index < _whitelist.length; index++) {
            whitelist[_whitelist[index]] = true;
        }
    }

    function changeMinter(address _minter, bool _active) external {
        require(msg.sender == owner, "DemoToken: Unauthorized.");

        whitelist[_minter] = _active;
    }

    function isMinter(address _requester) public view returns (bool) {
        return whitelist[_requester];
    }

    function mintTo(address _recipient, uint256 _amount) external {
        require(isMinter(msg.sender), "DemoToken: Unauthorized Mint.");

        _mint(_recipient, _amount);
    }

    function burnFrom(address _recipient, uint256 _amount) external {
        require(isMinter(msg.sender), "DemoToken: Unauthorized Burn.");

        _burn(_recipient, _amount);
    }

    function faucet() external {
        _mint(msg.sender, 10 ether);
    }
}
