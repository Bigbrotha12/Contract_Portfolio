// // SPDX-License-Identifier: MIT

// pragma solidity 0.8.20;

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //                                                IMPORTS
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// import {Script} from "forge-std/Script.sol";
// import {Test} from "forge-std/Test.sol";
// import {DemoToken} from "./../src/A_ERC20/DemoToken.sol";
// import {DemoTokenScript} from "./../script/DemoToken.s.sol";

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //                                               CONTRACTS
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// contract TestIBCBridge is Script, Test {

//     DemoToken public token;
//     DemoTokenScript public deployer;
//     string public constant NAME = "Demotoken";
//     string public constant SYMBOL = "DMT";
//     uint256 public constant TOKEN_AMOUNT = 100 ether;

//     function setUp() public {

//         address[] memory minters = new address[](1);
//         minters[0] = msg.sender;
//         deployer = new DemoTokenScript();
//         token = deployer.run(NAME, SYMBOL, minters);
//         token.mintTo(msg.sender, TOKEN_AMOUNT);
//     }

//     function testCorrectInitialization() public {}

//     function testAdminControlWhitelist() public {}

//     function testRevertUnauthorizedChangeWhitelist() public {}

//     function testWhitelistAddressCanMint() public {}

//     function testWhitelistAddressCanBurn() public {}

//     function testRevertUnauthorizedMint() public {}

//     function testRevertUnauthorizedBurn() public {}
// }