// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {ERC721} from "./ERC721/ERC721.sol";
import {ERC2981, IERC2981} from "./ERC2981/ERC2981.sol";
import {CommonStorage} from "./CommonStorage.sol";
import {IInitializable} from "./IInitializable.sol";
import {Bytes} from "./Library/Bytes.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title FamiliarLogic
/// @notice Contract implementation for NFT users
/// @dev Logic implementation or base contracts other 
/// @dev than CommonStorage must not declare any state variables
contract FamiliarLogic is CommonStorage, ERC721, ERC2981, IInitializable {
    using Bytes for bytes;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 ERRORS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    error FamiliarLogic__InvalidInitialization();
    error FamiliarLogic__TokenNotFound();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                MODIFIERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    modifier exists(uint256 _tokenId) {
        if(_ownerOf(_tokenId) == address(0)) revert FamiliarLogic__TokenNotFound();
        _;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    /// @notice Allows initialization of NFT core data by proxy upgrader.
    /// @dev Only callable from within proxy's upgradeAndInit function and only once.
    /// @param _data bytes received from proxy upgrade function
    function init(bytes[] calldata _data) external {
        if(!s_initializing_) revert FamiliarLogic__InvalidInitialization();
        
        s_name_ = string(_data[1]);
        s_symbol_ = string(_data[2]);
        s_rootURI_ = string(_data[3]);
    }

    /// @notice Mint function left open for testing and demonstration purposes.
    /// @param _to token receiver.
    /// @param _blueprint NFT blueprint to be created.
    function mint(address _to, bytes memory _blueprint) external {
        uint256 tokenId = s_supply_++;
        s_blueprints_[tokenId] = _blueprint;
        
        _safeMint(_to, tokenId);
    }

    /// @notice Returns the NFT data associated with given token ID
    /// @param _tokenId Id of token data being queried.
    function getTokenBlueprint(uint256 _tokenId) external view exists(_tokenId) returns (string memory) {
        return string(s_blueprints_[_tokenId]); 
    }

     /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC2981) returns (bool) {
        return
            interfaceId == type(IInitializable).interfaceId ||
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /// @notice Returns URI of given token's image data
    /// @param _tokenId     of token data being queried.
    function tokenURI(uint256 _tokenId) public view override exists(_tokenId) returns (string memory) {
        string memory size = s_blueprints_[_tokenId].substring(0,3);
        string memory baseURI = _baseURI();

        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, size)) : "";
    }

    function totalSupply() public view returns (uint256) {
        return s_supply_;
    }

    function _baseURI() internal view override returns (string memory) {
        return s_rootURI_;
    }
}