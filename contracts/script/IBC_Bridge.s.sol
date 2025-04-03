// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Script} from "forge-std/Script.sol";
import {DemoToken} from "./../src/A_ERC20/DemoToken.sol";
import {IBC_Bridge} from "./../src/C_IBC_Messenger/IBC_Bridge.sol";
import {EIP712X} from "./../src/C_IBC_Messenger/EIP712X.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

contract AirdropScript is Script {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    DemoToken public s_token;
    uint256 public constant TOKEN_AMOUNT = 100 ether;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function run() public returns (IBC_Bridge bridge) {
        address[] memory minters = new address[](1);
        minters[0] = msg.sender;

        vm.startBroadcast();

        s_token = new DemoToken("DemoToken", "DMT", minters);
        s_token.mintTo(msg.sender, TOKEN_AMOUNT);
        bridge = new IBC_Bridge("Bridge", "IBC", msg.sender, s_token);

        vm.stopBroadcast();
        
    }
}