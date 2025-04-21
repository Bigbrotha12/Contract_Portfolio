// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Script} from "forge-std/Script.sol";
import {Test} from "forge-std/Test.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {NFTScript} from "./../script/UpgradableNFT.s.sol";
import {FamiliarLogic} from "./../src/F_Upgradable_NFT/FamiliarLogic.sol";
import {FamiliarAdmin} from "./../src/F_Upgradable_NFT/FamiliarAdmin.sol";
import {FamiliarIMX} from "./../src/F_Upgradable_NFT/FamiliarIMX.sol";
import {FamiliarProxy} from "./../src/F_Upgradable_NFT/FamiliarProxy.sol";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

contract TestUpgradableNFT is Script, Test {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    FamiliarLogic public s_logicContract;
    FamiliarAdmin public s_adminContract;
    FamiliarIMX public s_imxContract;
    FamiliarProxy public s_proxyContract;
    address public s_adminRole = makeAddr("ADMIN_ROLE");
    address public s_newAdmin = makeAddr("NEW_ADMIN");
    address public s_imxRole = makeAddr("IMX_ROLE");
    address public s_publicRole = makeAddr("PUBLIC_ROLE");
    address public s_newTarget = makeAddr("NEW_TARGET");
    string constant BLUEPRINT_BLOB = "{1}:{blueprint}";
    string constant BLUEPRINT = "{blueprint}";
    uint256 constant TEST_TOKEN_ID = 1;
    string constant TEST_URI = "https://picsum.photos/";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    event CurrentRouting(address role, address target);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setUp() public {

        // Deploy NFT and Proxies
        NFTScript deployer = new NFTScript();
        (s_logicContract, s_adminContract, s_imxContract, s_proxyContract) = deployer.run();
    }

    function testCorrectInitialization() public {
        vm.startPrank(s_adminRole);

        vm.expectEmit();
        emit CurrentRouting(s_adminRole, address(s_adminContract));
        s_proxyContract.getRouting(s_adminRole);

        vm.expectEmit();
        emit CurrentRouting(s_imxRole, address(s_imxContract));
        s_proxyContract.getRouting(s_imxRole);

        vm.stopPrank();
    }   

    function testAdminCanChangeAdmin() public {
        vm.prank(s_adminRole);
        s_proxyContract.changeAdmin(s_newAdmin);

        vm.prank(s_newAdmin);
        vm.expectEmit();
        emit CurrentRouting(s_newAdmin, address(s_adminContract));
        s_proxyContract.getRouting(s_newAdmin);
    }

    function testAdminCanChangeRouting() public {
        vm.startPrank(s_adminRole);

        s_proxyContract.changeRouting(s_adminRole, s_newTarget);
        s_proxyContract.changeRouting(s_imxRole, s_newTarget);
        
        vm.expectEmit();
        emit CurrentRouting(s_adminRole, s_newTarget);
        s_proxyContract.getRouting(s_adminRole);

        vm.expectEmit();
        emit CurrentRouting(s_imxRole, s_newTarget);
        s_proxyContract.getRouting(s_imxRole);

        vm.stopPrank();
    }

    function testRevertProxyChecksUpgradeTargetInterface() public {
        bytes[] memory initData = new bytes[](4);
        initData[0] = "1.0";    // Version
        initData[1] = "Familiar";   // Name
        initData[2] = "FAM";    // Symbol
        initData[3] = bytes(TEST_URI);

        vm.startPrank(s_adminRole);

        // NEW_TARGET does not implement interface and should revert
        vm.expectRevert(FamiliarProxy.FamiliarProxy__MissingInterface.selector);
        s_proxyContract.upgradeInit(IERC165(s_newTarget), initData);

        vm.stopPrank();
    }

    function testRevertProxyIsTransparent() public {
        vm.startPrank(s_adminRole);

        FamiliarLogic logicProxy = FamiliarLogic(address(s_proxyContract));

        vm.expectRevert();
        logicProxy.totalSupply();

        vm.stopPrank();
    }

    function testIMXContractCanMint() public {
        // Minting blob struct: {token_id}:{blueprint}
        bytes memory blueprint = abi.encodePacked(BLUEPRINT_BLOB);

        vm.startPrank(s_imxRole);

        FamiliarIMX imxProxy = FamiliarIMX(address(s_proxyContract));
        imxProxy.mintFor(s_publicRole, 1, blueprint);

        vm.stopPrank();

        vm.startPrank(s_publicRole);

        // Check user received NFT
        FamiliarLogic logicProxy = FamiliarLogic(address(s_proxyContract));
        address owner = logicProxy.ownerOf(TEST_TOKEN_ID);
        string memory data = logicProxy.getTokenBlueprint(TEST_TOKEN_ID);

        vm.stopPrank();

        assertEq(owner, s_publicRole);
        assertEq(data, BLUEPRINT);
    }

    function testRevertsUnauthorized() public {
        // Non-admin reverts changeAdmin attempt
        vm.expectRevert();
        s_proxyContract.changeAdmin(s_newAdmin);
    }

    function testNFTHasCorrectURL() public {
        // Create NFT
        // Minting blob struct: {token_id}:{blueprint}
        bytes memory blueprint = abi.encodePacked(BLUEPRINT_BLOB);

        vm.startPrank(s_imxRole);

        FamiliarIMX imxProxy = FamiliarIMX(address(s_proxyContract));
        imxProxy.mintFor(s_publicRole, 1, blueprint);

        vm.stopPrank();

        // Check URI
        FamiliarLogic logicProxy = FamiliarLogic(address(s_proxyContract));
        
        vm.prank(s_publicRole);
        string memory uri = logicProxy.tokenURI(TEST_TOKEN_ID);

        assertEq(uri, TEST_URI);
    }
}