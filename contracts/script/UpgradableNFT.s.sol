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

    address public s_adminRole = makeAddr("ADMIN_ROLE");
    address public s_imxRole = makeAddr("IMX_ROLE");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function run() public returns (FamiliarLogic logic) {
        bytes[] memory initData = new bytes[](4);
        initData[0] = "1.0";    // Version
        initData[1] = "Familiar";   // Name
        initData[2] = "FAM";    // Symbol
        initData[3] = "https://picsum.photos/"; // RootURI

        vm.startBroadcast();

        logic = new FamiliarLogic();  /// <--- NFT Token
        FamiliarAdmin admin = new FamiliarAdmin();
        FamiliarIMX imx = new FamiliarIMX();
        
        address[] memory routingConfig = new address[](4);
        routingConfig[0] = s_adminRole;
        routingConfig[1] = address(admin);
        routingConfig[2] = s_imxRole;
        routingConfig[3] = address(imx);

        FamiliarProxy proxy = new FamiliarProxy(routingConfig);
        proxy.upgradeInit(IERC165(address(logic)), initData);
        
        vm.stopBroadcast();
    }
}