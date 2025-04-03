// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Arrays} from "@openzeppelin/contracts/utils/Arrays.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                LIBRARY
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

library MerkleTreeUtils {
    using Arrays for bytes32[];
    using Math for uint256;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function createLeaves(
        address[] memory _recipients, 
        uint256[] memory _amounts
    ) 
    external 
    pure 
    returns (bytes32[] memory) 
    {
        if(_recipients.length != _amounts.length) revert("Invalid input");

        bytes32[] memory leaves = new bytes32[](_recipients.length);

        for(uint8 i = 0; i < _recipients.length; i++)
        {
            bytes32 hashed = keccak256(abi.encodePacked(_recipients[i], _amounts[i]));
            leaves[i] = hashed; 
        }

        return leaves.sort(); 
    }

    function computeProof(
        bytes32[] memory _leaves, 
        address _address, 
        uint256 _amount
    ) 
    external 
    pure 
    returns (bytes32[] memory) 
    { 
        if(_leaves.length < 1) revert();

        bytes32 leafHash = keccak256(abi.encodePacked(_address, _amount));
        uint256 sortedIndex = _indexOf(_leaves, leafHash); 
        if(sortedIndex == type(uint256).max) revert("Leaf not found");

        uint256 treeDept = _getHeight(_leaves.length);
        bytes32[] memory proof = new bytes32[](treeDept); 

        bytes32 sibling;
        bytes32 hashed;
        uint256 insertIndex;

        while(_leaves.length >= 2)
        { 
            if(sortedIndex % 2 == 0)
            {
                sibling = _leaves[sortedIndex+1];
                hashed = keccak256(abi.encodePacked(_leaves[sortedIndex], sibling));
            } else
            {   
                sibling = _leaves[sortedIndex-1];
                hashed = keccak256(abi.encodePacked(sibling, _leaves[sortedIndex])); 
            }

            proof[insertIndex++] = sibling;
            _leaves = _reduceMerkle(_leaves);
            sortedIndex = _indexOf(_leaves, hashed); 
        }
        
        return proof; 
    }

    function computeMerkleRoot(bytes32[] memory hashedLeaves) public pure returns (bytes32[] memory) { 
        if(hashedLeaves.length < 2) revert();
        
        bytes32[] memory saneLeaves;
        if(hashedLeaves.length % 2 != 0)
        {
            saneLeaves = new bytes32[](hashedLeaves.length + 1);
            saneLeaves[hashedLeaves.length] = keccak256(abi.encodePacked(address(0), uint256(0)));
        } else {
            saneLeaves = hashedLeaves;
        }
        
        uint256 iterations = saneLeaves.length / 2;
        uint256 insertIndex;
        bytes32[] memory nodes = new bytes32[](iterations);

        for(uint256 i = 0; i <= iterations; i += 2)
        {
            bytes32 hashed = keccak256(abi.encodePacked(saneLeaves[i], saneLeaves[i+1]));
            nodes[insertIndex] = hashed;
            insertIndex++;
        }

        nodes = nodes.sort(); 
        
        if(nodes.length > 1) 
        {
            return computeMerkleRoot(nodes); 
        } else {
            return nodes; 
        }
    }

    function _reduceMerkle(bytes32[] memory leafHashes) internal pure returns (bytes32[] memory) {
        if(leafHashes.length == 0) revert();
        if(leafHashes.length % 2 != 0) revert();

        bytes32[] memory nodes;
        uint256 index;
    
        for(uint256 i = 0; i <= leafHashes.length / 2; i += 2)
        {
            bytes32 hashed = keccak256(abi.encodePacked(leafHashes[i], leafHashes[i+1]));
            nodes[index] = hashed;
            index++;
        }
    
        return nodes.sort(); 
    }

    function _getHeight(uint256 numLeaves) internal pure returns (uint256) {
        return numLeaves.sqrt();
    }

    function _indexOf(bytes32[] memory arr, bytes32 data) internal pure returns (uint256) {
        uint256 NOT_FOUND = type(uint256).max;

        for(uint256 i = 0; i < arr.length; i++)
        {
            if (arr[i] == data)
                return i; 
        }
        return NOT_FOUND;
    }
}
