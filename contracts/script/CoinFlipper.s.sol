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

    uint96 constant BASE_FEE = 1 ether;
    uint96 constant GAS_PRICE = 2 ether;
    bytes32 constant KEY_HASH = bytes32(0);
    uint256 public constant TOKEN_AMOUNT = 100 ether;
    address public s_admin = makeAddr("ADMIN");
    address public s_minter = makeAddr("MINTER");
    

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function run() 
    public 
    returns (CoinFlipper flipper, DemoToken token, VRFCoordinatorMock mock, LinkTokenInterface IlinkToken) 
    {
        address[] memory minters = new address[](1);
        minters[0] = s_minter;
        
        vm.startBroadcast();

        LinkToken linkToken = new LinkToken();
        token = new DemoToken("DemoToken", "DMT", minters, s_admin);
        mock = new VRFCoordinatorMock(BASE_FEE, GAS_PRICE); 
        IlinkToken = LinkTokenInterface(address(linkToken));
        flipper = new CoinFlipper(address(mock), KEY_HASH, IlinkToken, token);
        linkToken.setBalance(address(flipper), TOKEN_AMOUNT);

        vm.stopBroadcast();
    }
}