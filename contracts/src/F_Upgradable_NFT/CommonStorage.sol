// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title CommonStorage
/// @author Rafael Mendoza
/// @notice Defines all state variables to be maintained by proxy and implementation contracts.
abstract contract CommonStorage {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
     struct RoyaltyInfo { 
        address receiver; 
        uint96 royaltyFraction; 
    }

    // Maintain IMX integration data
    address internal s_imx_;
    mapping(uint256 tokenId => bytes blueprint) internal s_blueprints_;

    // Maintain ERC721 NFT and royalty data
    string internal s_name_;
    string internal s_symbol_;
    string internal s_rootURI_;
    uint256 internal s_supply_;
    mapping(uint256 tokenId => address owner) internal s_owners_;
    mapping(address owner => uint256 balance) internal s_balances_;
    mapping(uint256 tokenId => address approval) internal s_tokenApprovals_;
    mapping(address owner => mapping(address operator => bool status)) internal s_operatorApprovals_;
    RoyaltyInfo internal s_defaultRoyaltyInfo_;
    mapping(uint256 tokenId => RoyaltyInfo royalty) internal s_tokenRoyaltyInfo_;

    // Maintain proxy administration and routing data
    address internal s_admin_;
    bool internal s_initializing_;
    mapping(address target => bool status) internal s_initialized_;
    mapping(address user => address target) internal s_callRouting_;
    mapping(address target => string version) internal s_version_;

    // Maintain generic state variables pattern to allow expansion of state variables in future implementations
    // without risking storage-collision
    mapping(string varName => address value) internal s_address_;
    mapping(string varName => uint256 value) internal s_uint_;
    mapping(string varName => int256 value) internal s_int_;
    mapping(string varName => bytes value) internal s_bytes_;
    mapping(string varName => string value) internal s_string_;
    mapping(string varName => bool value) internal s_bool_;
    mapping(string varName => bytes[] value) internal s_array_;
    mapping(string varName => mapping(string => bytes[])) internal s_mapping_;
}