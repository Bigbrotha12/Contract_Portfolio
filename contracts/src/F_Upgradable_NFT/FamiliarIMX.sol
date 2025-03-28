// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {ERC721, IERC721} from "./ERC721/ERC721.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {Mintable, IMintable} from "./IMXBridge/Mintable.sol";
import {CommonStorage} from "./CommonStorage.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title Familiar Logic Implementation
/// @notice NFT contract implementation for IMX minting
/// @dev Logic implementation or base contracts other than CommonStorage must not declare any state variables
contract FamiliarIMX is CommonStorage, ERC721, Mintable {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function _mintFor(address _to, uint256 _id, bytes memory _blueprint) internal override {
        s_blueprints_[_id] = _blueprint;
        _safeMint(_to, _id);
    }

     /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IMintable).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}