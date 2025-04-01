// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Script} from "forge-std/Script.sol";
import {AirdropClaim} from "./../src/B_Airdrop/AirdropClaim.sol";
import {AirdropDemo} from "./../src/B_Airdrop/AirdropDemo.sol";
import {AirdropToken} from "./../src/B_Airdrop/AirdropToken.sol";
import {MerkleTreeUtils} from "./MerkleTreeUtils.s.sol";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

contract AirdropScript is Script {
    using MerkleTreeUtils for bytes32[];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    uint256 public constant AIRDROP_AMOUNT = 100e18;
    bytes32 public s_merkleRoot;
    address public s_tokenAddress;
    uint256 public s_deadline;

    address constant USER_1 = address(100);
    address constant USER_2 = address(200);
    address constant USER_3 = address(300);
    address constant USER_4 = address(400);
    address constant USER_5 = address(500);
    uint256 constant REWARD = 10e18;
    MerkleTreeUtils.Leaf[] public s_airdropData;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setUp() public {
        // User mock data
        MerkleTreeUtils.Leaf memory player1 = MerkleTreeUtils.Leaf(USER_1, REWARD);
        MerkleTreeUtils.Leaf memory player2 = MerkleTreeUtils.Leaf(USER_2, REWARD);
        MerkleTreeUtils.Leaf memory player3 = MerkleTreeUtils.Leaf(USER_3, REWARD);
        MerkleTreeUtils.Leaf memory player4 = MerkleTreeUtils.Leaf(USER_4, REWARD);
        MerkleTreeUtils.Leaf memory player5 = MerkleTreeUtils.Leaf(USER_5, REWARD);
        s_airdropData = [player1, player2, player3, player4, player5];

        // Calculate merkle root
        bytes32[] memory leaves = MerkleTreeUtils.createLeaves(s_airdropData);
        s_merkleRoot = leaves.computeMerkleRoot()[0];
    }

    function run() public {
        vm.broadcast();
        
        new AirdropClaim(s_merkleRoot, s_tokenAddress, s_deadline);

        vm.stopBroadcast();

    }
}


