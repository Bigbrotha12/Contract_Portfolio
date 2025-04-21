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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    DemoToken public s_token;
    string public constant NAME = "DemoToken";
    string public constant SYMBOL = "DMT";
    address public s_admin = makeAddr("ADMIN");
    address public s_minter = makeAddr("MINTER");
    uint256 public constant TOKEN_AMOUNT = 100 ether;
    uint256 public constant FAUCET_AMOUNT = 10 ether;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setUp() public {
        DemoTokenScript deployer = new DemoTokenScript();
        s_token = deployer.run();

        vm.prank(s_minter);
        s_token.mintTo(s_minter, TOKEN_AMOUNT);
    }

    function testCorrectInitialization() public view {
        // Check name, symbol, minters are correct
        string memory initialName = s_token.name();
        string memory initialSymbol = s_token.symbol();
         
        assertEq(initialName, NAME);
        assertEq(initialSymbol, SYMBOL);
        assertTrue(s_token.isMinter(s_minter));
    }

    function testAdminControlWhitelist() public {
        // The admin (test address in this case) add/remove minter accounts
        address additionalMinter = makeAddr("ADDITIONAL_MINTER");
        assertTrue(!s_token.isMinter(additionalMinter));

        vm.prank(s_admin);
        s_token.changeMinter(additionalMinter, true);

        assertTrue(s_token.isMinter(additionalMinter));
    }

    function testRevertUnauthorizedChangeWhitelist() public {
        // Non-admin account cannot change minter whitelist
        address notAdmin = makeAddr("NOT_ADMIN");
        address additionalMinter = makeAddr("ADDITIONAL_MINTER");

        vm.prank(notAdmin);
        vm.expectRevert();
        s_token.changeMinter(additionalMinter, true);
    }

    function testWhitelistAddressCanMint() public {
        // A whitelisted minter can mint new tokens
        address user = makeAddr("USER");
        assertEq(s_token.balanceOf(user), 0);

        vm.prank(s_minter);
        s_token.mintTo(user, TOKEN_AMOUNT);

        assertEq(s_token.balanceOf(user), TOKEN_AMOUNT);
    }

    function testWhitelistAddressCanBurn() public {
        // A whitelisted minter can burn tokens from user
        address user = makeAddr("USER");
        vm.prank(s_minter);
        s_token.mintTo(user, TOKEN_AMOUNT);
      
        assertEq(s_token.balanceOf(user), TOKEN_AMOUNT);

        vm.prank(s_minter);
        s_token.burnFrom(user, TOKEN_AMOUNT);

        assertEq(s_token.balanceOf(user), 0);
    }

    function testFaucetIsOpenToPublic(address _publicAddress) public {
        // Any address can get tokens
        if(_publicAddress == address(0)) {
            return;
        }

        assertEq(s_token.balanceOf(_publicAddress), 0);

        vm.prank(_publicAddress);
        s_token.faucet();

        assertEq(s_token.balanceOf(_publicAddress), FAUCET_AMOUNT);
    }

    function testRevertUnauthorizedMint(address _notMinter, address _recipient) public {
        // Non-minter cannot call mint function
        vm.prank(_notMinter);
        vm.expectRevert();
        s_token.burnFrom(_recipient, TOKEN_AMOUNT);
    }

    function testRevertUnauthorizedBurn(address _notMinter, address _recipient) public {
        // Non-minter cannot call burn function
        vm.prank(_notMinter);
        vm.expectRevert();
        s_token.mintTo(_recipient, TOKEN_AMOUNT);
    }
}