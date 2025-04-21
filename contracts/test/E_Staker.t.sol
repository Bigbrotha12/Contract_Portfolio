// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Script} from "forge-std/Script.sol";
import {Test} from "forge-std/Test.sol";
import {DemoToken} from "./../src/A_ERC20/DemoToken.sol";
import {DemoTokenScript} from "./../script/DemoToken.s.sol";
import {StakerScript} from "./../script/Staker.s.sol";
import {Staker} from "./../src/E_Staker/Staker.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

contract TestStaker is Script, Test {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    DemoToken public s_stakeToken;
    DemoToken public s_rewardToken;
    Staker public s_staker;
    address public s_admin = makeAddr("ADMIN");
    address public s_minter = makeAddr("MINTER");
    address public s_user = makeAddr("USER");
    address public s_otherUser = makeAddr("OTHER");
    uint256 public constant DURATION = 100;
    uint256 public constant REWARD_AMOUNT = 500 ether;
    uint256 public constant FAUCET_AMOUNT = 10 ether;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                MODIFIERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    modifier initiate(uint256 _duration, uint256 _reward) {
        vm.startPrank(s_admin);
        s_staker.setRewardsDuration(_duration);
        s_staker.setRewardAmount(_reward);
        vm.stopPrank();

        _;
    }

    modifier fundUser() {
        vm.prank(s_user);
        s_stakeToken.faucet();

        vm.prank(s_otherUser);
        s_stakeToken.faucet();

        _;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setUp() public {

        // Staker deploy
        StakerScript stakerDeployer = new StakerScript();
        s_staker = stakerDeployer.run();

        (address stakeToken, address rewardToken) = stakerDeployer.tokenAdress();
        s_stakeToken = DemoToken(stakeToken);
        s_rewardToken = DemoToken(rewardToken);
    }

    function testCorrectInitialization() public view {
        DemoToken fundsToken = s_staker.s_stakingToken();
        DemoToken rewardToken = s_staker.s_rewardsToken();

        assertEq(address(fundsToken), address(s_stakeToken));
        assertEq(address(rewardToken), address(s_rewardToken));
    }

    function testAdminCanStartStakingProgram() public {
        vm.startPrank(s_admin);

        // Set program duration 100 blocks
        vm.expectEmit(false, false, false, true);
        s_staker.setRewardsDuration(DURATION);

        // Set reward amount 500 ethers
        vm.expectEmit(false, false, false, true);
        s_staker.setRewardAmount(REWARD_AMOUNT);

        vm.stopPrank();
    }

    function testRevertAdminCannotStartMultipleProgramsConcurrently() public initiate(DURATION, REWARD_AMOUNT) {
        vm.startPrank(s_admin);

        // Additional calls to setrewardDuration and setRewardAmount should fail to after program concludes
        vm.expectRevert();
        s_staker.setRewardsDuration(DURATION);
        vm.expectRevert();
        s_staker.setRewardAmount(REWARD_AMOUNT);

        // After 100 blocks have passed, the function should be callable again
        vm.roll(100);

        // Set program duration 100 blocks
        s_staker.setRewardsDuration(DURATION);
        s_staker.setRewardAmount(REWARD_AMOUNT);

        vm.stopPrank();
    }

    function testUserCanFundViaStake() public fundUser {
        vm.prank(s_user);
        s_staker.stake(FAUCET_AMOUNT);

        // Check balances
        uint256 userBalance = s_staker.s_balanceOf(s_user);
        assertEq(userBalance, FAUCET_AMOUNT);
    }

    function testRewardAllocatedCorrectlyToUserOverTime() public initiate(DURATION, REWARD_AMOUNT) fundUser {
        // User 1 and 2 each stake 10 ether.
        vm.prank(s_user);
        s_staker.stake(FAUCET_AMOUNT);
        vm.prank(s_otherUser);
        s_staker.stake(FAUCET_AMOUNT);

        // Reward at block 0 (0%) should be 0.
        // vm.roll(0);
        uint256 userBalance = s_staker.earned(s_user);
        uint256 otherUserBalance = s_staker.earned(s_otherUser);
        uint256 earnedAmount = REWARD_AMOUNT * 0 / 100;
        assertEq(userBalance, earnedAmount / 2);
        assertEq(otherUserBalance, earnedAmount / 2);

        // Reward at block 50 (50%) should be 250 / 2 each.
        vm.roll(50);
        userBalance = s_staker.earned(s_user);
        otherUserBalance = s_staker.earned(s_otherUser);
        earnedAmount = REWARD_AMOUNT * 50 / 100;
        assertEq(userBalance, earnedAmount / 2);
        assertEq(otherUserBalance, earnedAmount / 2);

        // Reward at block 100 (100%) should be 500 / 2 each.
        vm.roll(100);
        userBalance = s_staker.earned(s_user);
        otherUserBalance = s_staker.earned(s_otherUser);
        earnedAmount = REWARD_AMOUNT * 100 / 100;
        assertEq(userBalance, earnedAmount / 2);
        assertEq(otherUserBalance, earnedAmount / 2);
    }

    function testUserCanWithdrawStakeReward() public initiate(DURATION, REWARD_AMOUNT) fundUser {
        // User 1 stake 10 ethers.
        vm.startPrank(s_user);
        s_staker.stake(FAUCET_AMOUNT);

        // After 50 blocks user can withdraw reward (500 * 50%)
        vm.roll(50);
        s_staker.getReward();
        uint256 rewardBalance = s_rewardToken.balanceOf(s_user);
        assertEq(rewardBalance, REWARD_AMOUNT * 50 / 100);

        // After 100 block user can withdraw another (500 * 100%)
        vm.roll(100);
        s_staker.getReward();
        rewardBalance = s_rewardToken.balanceOf(s_user);
        assertEq(rewardBalance, REWARD_AMOUNT * 100 / 100);

        vm.stopPrank();
    }

    function testUserCanWithdrawInitialFunds() public initiate(DURATION, REWARD_AMOUNT) fundUser {
        // User 1 stakes 10 ether
        vm.startPrank(s_user);
        s_staker.stake(FAUCET_AMOUNT);
        uint256 balance = s_stakeToken.balanceOf(s_user);
        assertEq(balance, 0);

        // After 100 blocks user can withdraw original 10 ether
        vm.roll(100);
        s_staker.withdraw(FAUCET_AMOUNT);
        balance = s_stakeToken.balanceOf(s_user);
        assertEq(balance, FAUCET_AMOUNT);

        vm.stopPrank();
    }
}