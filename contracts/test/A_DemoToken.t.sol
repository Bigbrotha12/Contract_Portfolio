// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {Test} from "forge-std/Test.sol";
import {DemoToken} from "./../src/A_ERC20/DemoToken.sol";
import {DemoTokenScript} from "./../script/DemoToken.s.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

contract TestDemoToken is Script, Test {

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

    function testCorrectInitialization() public view {
        // Check name, symbol, minters are correct
        string memory initialName = token.name();
        string memory initialSymbol = token.symbol();
         
        assertEq(initialName, NAME);
        assertEq(initialSymbol, SYMBOL);
        assertTrue(token.isMinter(s_minter));
    }

    function testAdminControlWhitelist() public {
        // The admin (test address in this case) add/remove minter accounts
        address additionalMinter = makeAddr("ADDITIONAL_MINTER");
        assertTrue(!token.isMinter(additionalMinter));

        vm.prank(s_admin);
        token.changeMinter(additionalMinter, true);

        assertTrue(token.isMinter(additionalMinter));
    }

    function testRevertUnauthorizedChangeWhitelist() public {
        // Non-admin account cannot change minter whitelist
        address notAdmin = makeAddr("NOT_ADMIN");
        address additionalMinter = makeAddr("ADDITIONAL_MINTER");

        vm.prank(notAdmin);
        vm.expectRevert();
        token.changeMinter(additionalMinter, true);
    }

    function testWhitelistAddressCanMint() public {
        // A whitelisted minter can mint new tokens
        address user = makeAddr("USER");
        assertEq(token.balanceOf(user), 0);

        vm.prank(s_minter);
        token.mintTo(user, TOKEN_AMOUNT);

        assertEq(token.balanceOf(user), TOKEN_AMOUNT);
    }

    function testWhitelistAddressCanBurn() public {
        // A whitelisted minter can burn tokens from user
        address user = makeAddr("USER");
        vm.prank(s_minter);
        token.mintTo(user, TOKEN_AMOUNT);
      
        assertEq(token.balanceOf(user), TOKEN_AMOUNT);

        vm.prank(s_minter);
        token.burnFrom(user, TOKEN_AMOUNT);

        assertEq(token.balanceOf(user), 0);
    }

    function testFaucetIsOpenToPublic(address _publicAddress) public {
        // Any address can get tokens
        if(_publicAddress == address(0)) {
            return;
        }

        assertEq(token.balanceOf(_publicAddress), 0);

        vm.prank(_publicAddress);
        token.faucet();

        assertEq(token.balanceOf(_publicAddress), FAUCET_AMOUNT);
    }

    function testRevertUnauthorizedMint(address _notMinter, address _recipient) public {
        // Non-minter cannot call mint function
        vm.prank(_notMinter);
        vm.expectRevert();
        token.burnFrom(_recipient, TOKEN_AMOUNT);
    }

    function testRevertUnauthorizedBurn(address _notMinter, address _recipient) public {
        // Non-minter cannot call burn function
        vm.prank(_notMinter);
        vm.expectRevert();
        token.mintTo(_recipient, TOKEN_AMOUNT);
    }
}