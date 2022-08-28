// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/// @title CommonStorage
/// @notice Defines all state variables to be maintained by proxy and
/// @notice implementation contracts.
abstract contract CommonStorage {

    //------------------ STATE VARIABLES ---------------------------------------
    
    // Maintain ownership data required for Ownable contract
    // as well as implementation contract initialization status
    address internal _owner;
    mapping(address => bool) internal _initStatus;
    mapping(address => string) internal _version;

    // Maintain IMX integration variables
    address internal _imx;
    mapping(uint256 => bytes) internal _blueprints;

    // Maintain ERC721 NFT data
    string internal _name;
    string internal _symbol;
    string internal _rootURI;
    mapping(uint256 => address) internal _owners;
    mapping(address => uint256) internal _balances;
    mapping(uint256 => address) internal _tokenApprovals;
    mapping(address => mapping(address => bool)) internal _operatorApprovals;

    // Maintain generic implementation state variables
    // Pattern used to allow expansion of state variables in future implementations
    // without risking storage-collision
    mapping(string => address) internal _address;
    mapping(string => uint) internal _uint;
    mapping(string => int) internal _int;
    mapping(string => bytes) internal _bytes;
    mapping(string => string) internal _string;
    mapping(string => bool) internal _bool;
    mapping(string => bytes[]) internal _array;
    mapping(string => mapping(string => bytes[])) internal _mapping;

}