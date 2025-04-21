// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Script} from "forge-std/Script.sol";
import {Test} from "forge-std/Test.sol";
import {DemoToken} from "./../src/A_ERC20/DemoToken.sol";
import {AirdropClaim} from "./../src/B_Airdrop/AirdropClaim.sol";
import {DemoTokenScript} from "./../script/DemoToken.s.sol";
import {AirdropScript} from "./../script/Airdrop.s.sol";
import {MerkleTreeUtils} from "../script/MerkleTreeUtils.s.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

contract TestAirdrop is Script, Test {
    using MerkleTreeUtils for bytes32[];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Token ERC20 Deployer
    DemoToken public s_token;
    address public s_minter = makeAddr("MINTER");
    uint256 public constant TOKEN_AMOUNT = 100 ether;

    // Airdrop
    AirdropClaim public s_airdrop;
    AirdropScript public s_airdropDeployer;
    address public USER_1 = makeAddr("USER_1");
    address public USER_2 = makeAddr("USER_2");
    address public USER_3 = makeAddr("USER_3");
    address public USER_4 = makeAddr("USER_4");
    address public USER_5 = makeAddr("USER_5");
    uint256 constant REWARD = 10 ether;
    uint256 constant AIRDROP_DEADLINE = 1000;
    address[] public s_recipients;
    uint256[] public s_amounts;
    bytes32[] public s_leaves;
    bytes32 public s_merkleRoot;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setUp() public {
        // Deploy Demo Token
        DemoTokenScript tokenDeployer = new DemoTokenScript();
        s_token = tokenDeployer.run();

        // Deploy airdrop contract
        AirdropScript airdropDeployer = new AirdropScript();
        s_airdrop = airdropDeployer.run();
        s_airdrop.setAirdropToken(s_token);
    }

    modifier funded(uint256 _amount) {
        s_token.approve(address(s_airdrop), _amount);
        s_airdrop.depositERC20(_amount);
        _;
    }

    function testCorrectInitialization() public view {
        bytes32 root = s_airdrop.s_merkleRoot();
        address token = address(s_airdrop.s_token());
        uint256 deadline = s_airdrop.s_deadline();

        assertEq(root, s_merkleRoot);
        assertEq(token, address(s_token));
        assertEq(deadline, AIRDROP_DEADLINE);
    }

    function testAllowFunding() public {
        assertEq(s_token.balanceOf(address(s_airdrop)), 0);

        s_token.approve(address(s_airdrop), TOKEN_AMOUNT);
        s_airdrop.depositERC20(TOKEN_AMOUNT);

        assertEq(s_token.balanceOf(address(s_airdrop)), TOKEN_AMOUNT);
    }

    function testAllowValidUserToClaim() public funded(TOKEN_AMOUNT) {
        // Calculate proof
        bytes32[] memory proof_1 = s_leaves.computeProof(USER_1, REWARD);
        bytes32[] memory proof_2 = s_leaves.computeProof(USER_2, REWARD);
        bytes32[] memory proof_3 = s_leaves.computeProof(USER_3, REWARD);
        bytes32[] memory proof_4 = s_leaves.computeProof(USER_4, REWARD);
        bytes32[] memory proof_5 = s_leaves.computeProof(USER_5, REWARD);

        // Check balances before claim
        assertEq(s_token.balanceOf(USER_1), 0);
        assertEq(s_token.balanceOf(USER_2), 0);
        assertEq(s_token.balanceOf(USER_3), 0);
        assertEq(s_token.balanceOf(USER_4), 0);
        assertEq(s_token.balanceOf(USER_5), 0);

        // Claim reward
        s_airdrop.claim(USER_1, REWARD, proof_1);
        s_airdrop.claim(USER_2, REWARD, proof_2);
        s_airdrop.claim(USER_3, REWARD, proof_3);
        s_airdrop.claim(USER_4, REWARD, proof_4);
        s_airdrop.claim(USER_5, REWARD, proof_5);

        // Check balances after claim
        assertEq(s_token.balanceOf(USER_1), REWARD);
        assertEq(s_token.balanceOf(USER_2), REWARD);
        assertEq(s_token.balanceOf(USER_3), REWARD);
        assertEq(s_token.balanceOf(USER_4), REWARD);
        assertEq(s_token.balanceOf(USER_5), REWARD);
    }

    function testRevertClaimingSameRewardTwice() public funded(TOKEN_AMOUNT) {
        // Calculate proof for user 1
        bytes32[] memory proof_1 = s_leaves.computeProof(USER_1, REWARD);

        // Claim reward for user 1
        s_airdrop.claim(USER_1, REWARD, proof_1);

        // Attempt second claim
        vm.expectRevert();
        s_airdrop.claim(USER_1, REWARD, proof_1);
    }

    function testRevertInvalidClaim() public {
        // Calculate proof for user 1
        bytes32[] memory proof_1 = s_leaves.computeProof(USER_1, REWARD);

        // Claim wrong address
        vm.expectRevert();
        s_airdrop.claim(USER_2, REWARD, proof_1);

        // Claim wrong reward
        vm.expectRevert();
        s_airdrop.claim(USER_1, TOKEN_AMOUNT, proof_1);
    }
}