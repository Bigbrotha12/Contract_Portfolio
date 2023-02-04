// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title DemoToken
/// @notice Simple ERC20 token with default functionality
contract DemoToken is ERC20 {

    //------------------ STATE VARIABLES ---------------------------------------

    address public owner;
    mapping(address => bool) public whitelist;

    //------------------ EVENTS ---------------------------------------

    event MinterChanged(address indexed minter, bool newStatus);

    //--------------------  CONSTRUCTOR -------------------------------

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

    //--------------------  VIEW FUNCTIONS -------------------------------

    /// @notice Checks whether given address is allowed to mint tokens.
    /// @param _requester address to be checked.
    function isMinter(address _requester) public view returns (bool) {
        return whitelist[_requester];
    }

    //--------------------  MUTATIVE FUNCTIONS -------------------------------

    /// @notice Changes list of addresses allowed to mint new tokens.
    /// @param _minter address to be updated.
    /// @param _active permission to be given (true) or taken away (false).
    function changeMinter(address _minter, bool _active) external {
        require(msg.sender == owner, "DemoToken: Unauthorized.");

        whitelist[_minter] = _active;

        emit MinterChanged(_minter, _active);
    }

    /// @notice Allows whitelisted addresses to mint new tokens.
    /// @param _recipient address to receive new tokens.
    /// @param _amount of tokens to be minted.
    function mintTo(address _recipient, uint256 _amount) external {
        require(isMinter(msg.sender), "DemoToken: Unauthorized Mint.");

        _mint(_recipient, _amount);
    }

    /// @notice Allows whitelisted addresses to burn tokens from an address.
    /// @param _recipient address to receive new tokens.
    /// @param _amount of tokens to be minted.
    function burnFrom(address _recipient, uint256 _amount) external {
        require(isMinter(msg.sender), "DemoToken: Unauthorized Burn.");

        _burn(_recipient, _amount);
    }

    /// @notice Allows any addresses to obtain 10 tokens.
    /// @dev Function left open to facilitate demonstration of contract. 
    function faucet() external {
        _mint(msg.sender, 10 ether);
    }
}
