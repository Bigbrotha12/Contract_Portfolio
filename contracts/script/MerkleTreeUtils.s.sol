// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Arrays} from "@openzeppelin/contracts/utils/Arrays.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

library MerkleTreeUtils {
    using Arrays for bytes32[];
    using Math for uint256;

    struct Leaf {
        address to;
        uint256 amount;
    }

    function createLeaves(Leaf[] memory airdropData) external pure returns (bytes32[] memory) { 
        bytes32[] memory leaves = new bytes32[](airdropData.length);

        for(uint8 i = 0; i < airdropData.length; i++)
        {
            bytes32 hashed = keccak256(abi.encodePacked(airdropData[i].to, airdropData[i].amount));
            leaves[i] = hashed; 
        }

        return leaves.sort(); 
    }

    function computeProof(bytes32[] memory leaves, Leaf memory leaf) external pure returns (bytes32[] memory) { 
        if(leaves.length < 1) revert();

        bytes32 leafHash = keccak256(abi.encodePacked(leaf.to, leaf.amount));
        uint256 sortedIndex = _indexOf(leaves, leafHash); 
        if(sortedIndex == type(uint256).max) revert("Leaf not found");

        uint256 treeDept = _getHeight(leaves.length);
        bytes32[] memory proof = new bytes32[](treeDept); 

        bytes32 sibling;
        bytes32 hashed;
        uint256 insertIndex;

        while(leaves.length >= 2)
        { 
            if(sortedIndex % 2 == 0)
            {
                sibling = leaves[sortedIndex+1];
                hashed = keccak256(abi.encodePacked(leaves[sortedIndex], sibling));
            } else
            {   
                sibling = leaves[sortedIndex-1];
                hashed = keccak256(abi.encodePacked(sibling, leaves[sortedIndex])); 
            }

            proof[insertIndex++] = sibling;
            leaves = _reduceMerkle(leaves);
            sortedIndex = _indexOf(leaves, hashed); 
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
