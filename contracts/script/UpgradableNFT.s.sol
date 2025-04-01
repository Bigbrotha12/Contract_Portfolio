// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Script} from "forge-std/Script.sol";
import {CommonStorage} from "./../src/F_Upgradable_NFT/CommonStorage.sol";
import {FamiliarAdmin} from "./../src/F_Upgradable_NFT/FamiliarAdmin.sol";
import {FamiliarLogic} from "./../src/F_Upgradable_NFT/FamiliarLogic.sol";
import {FamiliarIMX} from "./../src/F_Upgradable_NFT/FamiliarIMX.sol";
import {FamiliarProxy, IERC165} from "./../src/F_Upgradable_NFT/FamiliarProxy.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

contract AirdropScript is Script {

    address public s_adminRole = vm.addr(1);
    address public s_imxRole = vm.addr(2);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        FamiliarLogic logic = new FamiliarLogic();  /// <--- NFT Token
        FamiliarAdmin admin = new FamiliarAdmin();
        FamiliarIMX imx = new FamiliarIMX();
        
        address[] memory routingConfig = new address[](4);
        routingConfig[0] = s_adminRole;
        routingConfig[1] = address(admin);
        routingConfig[2] = s_imxRole;
        routingConfig[3] = address(imx);

        bytes[] memory initData = new bytes[](4);
        initData[0] = "1.0";    // Version
        initData[1] = "Familiar";   // Name
        initData[2] = "FAM";    // Symbol
        initData[3] = "https://picsum.photos/"; // RootURI

        FamiliarProxy proxy = new FamiliarProxy(routingConfig);
        proxy.upgradeInit(IERC165(address(logic)), initData);
        
        vm.stopBroadcast();
    }
}