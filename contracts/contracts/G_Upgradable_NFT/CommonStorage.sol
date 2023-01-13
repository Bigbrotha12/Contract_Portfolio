// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

/// @title CommonStorage
/// @notice Defines all state variables to be maintained by proxy and
/// @notice implementation contracts.
abstract contract CommonStorage {

    //------------------ STATE VARIABLES ---------------------------------------
    
    // Maintain IMX integration data
    address internal imx;
    mapping(uint256 => bytes) internal blueprints;

    // Maintain ERC721 NFT and royalty data
    string internal names;
    string internal symbols;
    string internal rootURI;
    mapping(uint256 => address) internal owners;
    mapping(address => uint256) internal balances;
    mapping(uint256 => address) internal tokenApprovals;
    mapping(address => mapping(address => bool)) internal operatorApprovals;
    struct RoyaltyInfo { address receiver; uint96 royaltyFraction; }
    RoyaltyInfo internal defaultRoyaltyInfo;
    mapping(uint256 => RoyaltyInfo) internal tokenRoyaltyInfo;

    // Maintain proxy administration and routing data
    address internal admin;
    bool internal initializing;
    mapping(address => bool) internal initialized;
    mapping(address => address) internal callRouting;
    mapping(address => string) internal version;

    // Maintain generic state variables
    // Pattern to allow expansion of state variables in future implementations
    // without risking storage-collision
    mapping(string => address) internal address_;
    mapping(string => uint) internal uint_;
    mapping(string => int) internal int_;
    mapping(string => bytes) internal bytes_;
    mapping(string => string) internal string_;
    mapping(string => bool) internal bool_;
    mapping(string => bytes[]) internal array_;
    mapping(string => mapping(string => bytes[])) internal mapping_;

}