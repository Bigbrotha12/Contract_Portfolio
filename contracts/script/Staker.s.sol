// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Script} from "forge-std/Script.sol";
import {Staker} from "./../src/E_Staker/Staker.sol";
import {DemoToken} from "./../src/A_ERC20/DemoToken.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

contract StakerScript is Script {

    DemoToken public s_tokenA;
    DemoToken public s_tokenB;
    uint256 public constant TOKEN_AMOUNT = 100 ether;
    address public s_admin = makeAddr("ADMIN");
    address public s_minter = makeAddr("MINTER");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function run() public returns (Staker staker) {
        address[] memory minters = new address[](1);
        minters[0] = s_minter;

        vm.startBroadcast();

        s_tokenA = new DemoToken("DemoTokenA", "DMTA", minters, s_admin);
        s_tokenB = new DemoToken("DemoTokenB", "DMTB", minters, s_admin);
        staker = new Staker(s_tokenA, s_tokenB, s_admin);
        
        vm.prank(s_admin);
        s_tokenA.changeMinter(address(staker), true);

        vm.stopBroadcast();
    }

    function tokenAdress() public view returns (address, address) {
        return (address(s_tokenA), address(s_tokenB));
    }
}