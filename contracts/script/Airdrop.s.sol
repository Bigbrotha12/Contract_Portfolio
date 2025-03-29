// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Script} from "forge-std/Script.sol";
import {AirdropClaim} from "./../src/B_Airdrop/AirdropClaim.sol";
import {AirdropDemo} from "./../src/B_Airdrop/AirdropDemo.sol";
import {AirdropToken} from "./../src/B_Airdrop/AirdropToken.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Arrays} from "@openzeppelin/contracts/utils/Arrays.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

contract AirdropScript is Script {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    uint256 public constant AIRDROP_AMOUNT = 100e18;
    bytes32 public immutable i_merkleRoot; 
    address public s_tokenAddress;
    uint256 public s_deadline;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setUp() public {

    }

    function run() public {

        AirdropClaim airdrop = new AirdropClaim(i_merkleRoot, s_tokenAddress, s_deadline);
    }


}

contract MerkleTreeUtils {
    using Arrays for bytes32[];

    struct Leaf {
        address to;
        uint256 amount;
    }

    function createLeaves(Leaf[] memory airdropData) public pure returns (bytes32[] memory) { 
        
        bytes32[] memory leaves = new bytes32[](airdropData.length);

        for(uint8 i = 0; i < airdropData.length; i++)
        {
            bytes32 hashed = keccak256(abi.encodePacked(airdropData[i].to, airdropData[i].amount));
            leaves[i] = hashed; 
        }

        return leaves.sort(); 
    }

    function getLeafAtIndex(uint256 index, Leaf[] memory airdropData) public pure returns (bytes32 hashed) {
        if(index >= airdropData.length) revert();
        hashed = keccak256(abi.encodePacked(airdropData[index].to, airdropData[index].amount));
    }

    function computeMerkleRoot(bytes32[] memory leaves) public pure returns (bytes32[] memory) { 
        if(leaves.length < 2 || leaves.length % 2 != 0) revert();

        uint256 iterations = leaves.length / 2;
        uint256 insertIndex;
        bytes32[] memory nodes = new bytes32[](iterations);

        for(uint256 i = 0; i <= iterations; i += 2)
        {
            bytes32 hashed = keccak256(abi.encodePacked(leaves[i], leaves[i+1]));
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

    function computeProof(Leaf leaf, bytes32[] memory leaves) public pure returns (bytes32[][] memory) { 
        uint256 treeDept = leaves.length >> 1;
        bytes32[][] proof = new bytes32[](treeDept);
        uint256 sortedIndex = leaves.indexOf(leaf); 
        bytes32 sibling;
        bytes32 hashed;

        while(leaves.length >= 2)
        { 
            if(sortedIndex % 2 == 0)
            {
                sibling = leaves[sortedIndex+1];
                hashed = keccak256(abi.encodePacked(leaf, sibling));
            } else
            {   
                sibling = leaves[sortedIndex-1];
                hashed = keccak256(abi.encodePacked(sibling, leaf)); 
            }

            proof.push(sibling);
            leaves = reduceMerkle(leaves);
            sortedIndex = leaves.indexOf(hashed); 
        }
        
        return proof; 
    }

    function reduceMerkle(bytes32[] memory leaves) public pure returns (bytes32[] memory) {
        bytes32[] memory nodes;
        uint256 index;
    
        for(uint256 i = 0; i <= leaves.length / 2; i += 2)
        {
            bytes32 hashed = keccak256(abi.encodePacked(leaves[i], leaves[i+1]));
            nodes[index] = hashed;
            index++;
        }
    
        return nodes.sort(); 
    }
}

