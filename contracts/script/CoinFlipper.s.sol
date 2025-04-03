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

    uint96 public baseFee = 1 ether;
    uint96 public gasPriceLink = 2 ether;
    bytes32 public keyHash = bytes32(0);
    LinkToken public s_linkToken;
    DemoToken public s_token;
    uint256 public constant TOKEN_AMOUNT = 100 ether;
    

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function run() public returns (CoinFlipper flipper) {
        address[] memory minters = new address[](1);
        minters[0] = msg.sender;
        
        vm.startBroadcast();

        s_linkToken = new LinkToken();
        s_token = new DemoToken("DemoToken", "DMT", minters);
        s_token.mintTo(msg.sender, TOKEN_AMOUNT);

        VRFCoordinatorMock mockVRF = new VRFCoordinatorMock(baseFee, gasPriceLink); 
        LinkTokenInterface linkToken = LinkTokenInterface(address(s_linkToken));
        
        flipper = new CoinFlipper(address(mockVRF), keyHash, linkToken, s_token);

        vm.stopBroadcast();
    }
}