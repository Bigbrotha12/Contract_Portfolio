// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Script} from "forge-std/Script.sol";
import {Test} from "forge-std/Test.sol";
import {DemoToken} from "./../src/A_ERC20/DemoToken.sol";
import {CoinFlipper} from "./../src/G_Oracle_Contract/CoinFlipper.sol";
import {CoinFlipperScript} from "./../script/CoinFlipper.s.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import {VRFCoordinatorV2Mock as VRFCoordinatorMock} from "@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol";
import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

contract TestCoinFlipper is Script, Test {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    DemoToken public s_token;
    CoinFlipper public s_flipper;
    VRFCoordinatorMock public s_mock;
    LinkTokenInterface public s_IlinkToken;
    address public s_admin = makeAddr("ADMIN");
    address public s_minter = makeAddr("MINTER");
    address public s_user = makeAddr("USER");
    bytes32 constant KEY_HASH = bytes32(0);
    uint256 public constant FAUCET_AMOUNT = 10 ether;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                MODIFIERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    modifier OracleRegistration() {
        // register contract with oracle
        s_flipper.subscribe();
        s_flipper.fundOracle();
        _;
    }

    modifier fund(address account) {
        vm.prank(account);
        s_token.faucet();
        _;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setUp() public {
        CoinFlipperScript deployer = new CoinFlipperScript();
        (s_flipper, s_token, s_mock, s_IlinkToken) = deployer.run();
    }

    function testCorrectInitialization() public view {
        VRFCoordinatorV2Interface mock = s_flipper.i_coordinator();
        LinkTokenInterface link = s_flipper.i_link();
        bytes32 keyHash = s_flipper.i_keyHash();
        DemoToken token = s_flipper.s_token();

        assertEq(address(mock), address(s_mock));
        assertEq(address(link), address(s_IlinkToken));
        assertEq(keyHash, KEY_HASH);
        assertEq(address(token), address(s_token));
    }

    function testUserCanAddFunds() public fund(s_user) {
        vm.prank(s_user);
        vm.expectEmit(true, false, false, true);
        s_flipper.placeBet(FAUCET_AMOUNT);

        uint256 balance = s_flipper.getBalance();
        assertEq(balance, FAUCET_AMOUNT);
    }

    function testUserCanWithdrawFunds() public fund(s_user) {
        vm.prank(s_user);
        s_flipper.placeBet(FAUCET_AMOUNT);

        uint256 balance = s_token.balanceOf(s_user);
        assertEq(balance, 0);

        s_flipper.payOut();
        balance = s_token.balanceOf(s_user);
        assertEq(balance, FAUCET_AMOUNT);
    }

    function testUserCanInitiateCoinFlip() public fund(s_user) OracleRegistration {
        vm.startPrank(s_user);
        s_flipper.placeBet(FAUCET_AMOUNT);

        vm.expectEmit(true, false, false, true);
        s_flipper.startCoinFlip();

        // Call mock oracle to fullfil request. First request id will be 0.
        vm.expectEmit(true, false, false, true);
        s_mock.fulfillRandomWords(0, address(s_flipper));
    }

    function testRevertWithdrawBeforeCoinflipResult() public fund(s_user) OracleRegistration {
        vm.startPrank(s_user);
        s_flipper.placeBet(FAUCET_AMOUNT);

        s_flipper.startCoinFlip();

        // Should revert attempts to payout before result.
        vm.expectRevert();
        s_flipper.payOut();
    }

    function testAdminCanWithdrawProfits() public {
        vm.startPrank(s_user);
        s_flipper.placeBet(FAUCET_AMOUNT);

        s_flipper.startCoinFlip();

        // Call mock oracle to fullfil request. First request id will be 0.
        s_mock.fulfillRandomWords(0, address(s_flipper));

        // Attempts to payout after result should succeed.
        vm.expectEmit(true, false, false, true);
        s_flipper.payOut();
    }
}








// });