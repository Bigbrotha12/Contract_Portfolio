// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Script} from "forge-std/Script.sol";
import {CoinFlipper} from "./../src/G_Oracle_Contract/CoinFlipper.sol";
import {DemoToken} from "./../src/A_ERC20/DemoToken.sol";
import {VRFCoordinatorV2Mock as VRFCoordinatorMock} from "@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol";
import {MockLinkToken as LinkToken} from "@chainlink/contracts/src/v0.8/mocks/MockLinkToken.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

contract CoinFlipperScript is Script {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    uint96 public baseFee = 1000;
    uint96 public gasPriceLink = 10;
    bytes32 public keyHash = bytes32(0);
    LinkToken public s_linkToken;
    DemoToken public s_token;
    uint256 public constant TOKEN_AMOUNT = 1e18;
    

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setUp() public {
        
    }

    function run() public {
        vm.startBroadcast();

        s_linkToken = new LinkToken();
        address[] memory minters = new address[](1);
        minters[0] = msg.sender;
        s_token = new DemoToken("DemoToken", "DMT", minters);
        s_token.mintTo(msg.sender, TOKEN_AMOUNT);

        VRFCoordinatorMock mockVRF = new VRFCoordinatorMock(baseFee, gasPriceLink); 
        LinkTokenInterface linkToken = LinkTokenInterface(address(s_linkToken));
        
        new CoinFlipper(address(mockVRF), keyHash, linkToken, s_token);

        vm.stopBroadcast();
    }
}