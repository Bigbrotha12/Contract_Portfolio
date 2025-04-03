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

contract AirdropScript is Script {

    DemoToken public s_tokenA;
    DemoToken public s_tokenB;
    uint256 public constant TOKEN_AMOUNT = 100 ether;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function run() public returns (Staker staker) {
        address[] memory minters = new address[](1);
        minters[0] = msg.sender;

        vm.startBroadcast();

        s_tokenA = new DemoToken("DemoTokenA", "DMTA", minters);
        s_tokenA.mintTo(msg.sender, TOKEN_AMOUNT);
        s_tokenB = new DemoToken("DemoTokenB", "DMTB", minters);
        s_tokenB.mintTo(msg.sender, TOKEN_AMOUNT);
        staker = new Staker(s_tokenA, s_tokenB);

        vm.stopBroadcast();
    }
}