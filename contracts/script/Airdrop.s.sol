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

    uint256 public constant AIRDROP_AMOUNT = 100 ether;
    bytes32 public s_merkleRoot;
    address public s_tokenAddress;
    uint256 public s_deadline;

    address public USER_1 = makeAddr("USER_1");
    address public USER_2 = makeAddr("USER_2");
    address public USER_3 = makeAddr("USER_3");
    address public USER_4 = makeAddr("USER_4");
    address public USER_5 = makeAddr("USER_5");
    uint256 constant REWARD = 10 ether;
    address[] public s_recipients;
    uint256[] public s_amounts;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setUp() public {
        // User mock data
        s_recipients = [USER_1, USER_2, USER_3, USER_4, USER_5];
        s_amounts = [REWARD, REWARD, REWARD, REWARD, REWARD];

        // Calculate merkle root
        bytes32[] memory leaves = MerkleTreeUtils.createLeaves(s_recipients, s_amounts);
        s_merkleRoot = leaves.computeMerkleRoot()[0];
    }

    function run() public {
        vm.startBroadcast();

        new AirdropClaim(s_merkleRoot, s_tokenAddress, s_deadline);

        vm.stopBroadcast();
    }
}


