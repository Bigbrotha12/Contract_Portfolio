// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Script} from "forge-std/Script.sol";
import {Test} from "forge-std/Test.sol";
import {DemoToken} from "./../src/A_ERC20/DemoToken.sol";
import {DemoTokenScript} from "./../script/DemoToken.s.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

contract TestAirdrop is Script, Test {

    // Token ERC20 Deployer
    DemoToken public token;
    DemoTokenScript public deployer;
    address public constant TEST_ADDRESS = 0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84;
    string public constant NAME = "DemoToken";
    string public constant SYMBOL = "DMT";
    address public s_admin = msg.sender;
    address public s_minter = makeAddr("MINTER");
    uint256 public constant TOKEN_AMOUNT = 100 ether;
    uint256 public constant FAUCET_AMOUNT = 10 ether;

    function setUp() public {

        address[] memory minters = new address[](1);
        minters[0] = s_minter;
        deployer = new DemoTokenScript();
        token = deployer.run(NAME, SYMBOL, minters);
        vm.prank(s_minter);
        token.mintTo(s_minter, TOKEN_AMOUNT);
    }

    function testCorrectInitialization() public {}

    function testAdminControlWhitelist() public {}

    function testRevertUnauthorizedChangeWhitelist() public {}

    function testWhitelistAddressCanMint() public {}

    function testWhitelistAddressCanBurn() public {}

    function testRevertUnauthorizedMint() public {}

    function testRevertUnauthorizedBurn() public {}
}