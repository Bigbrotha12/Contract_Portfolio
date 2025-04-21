// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Script} from "forge-std/Script.sol";
import {Test} from "forge-std/Test.sol";
import {DemoToken} from "./../src/A_ERC20/DemoToken.sol";
import {DemoTokenScript} from "./../script/DemoToken.s.sol";
import {IBC_Bridge} from "./../src/C_IBC_Messenger/IBC_Bridge.sol";
import {EIP712X} from "./../src/C_IBC_Messenger/IBC_Bridge.sol";
import {IBC_BridgeScript} from "./../script/IBC_Bridge.s.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

contract TestIBCBridge is Script, Test {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Token ERC20 Deployer
    DemoToken public s_token;
    address public s_admin = makeAddr("ADMIN");
    address public s_minter;
    uint256 public s_minterPk;
    uint256 public constant TOKEN_AMOUNT = 100 ether;

    // Bridge
    IBC_Bridge public s_bridge;

    // Mock data
    address immutable i_user = makeAddr("USER");
    address immutable i_notAdmin = makeAddr("NOT_ADMIN");
    address immutable i_admin = makeAddr("ADMIN");
    address immutable i_receiver = makeAddr("RECEIVER");
    uint256 immutable i_chain = block.chainid;
    uint256 immutable i_otherChain = 1337;
    string public constant BRIDGE_NAME = "IBC_DEMO";
    string public constant BRIDGE_VERSION = "0.0.1";
    uint256 constant BRIDGE_AMOUNT = 100 ether;
    uint256 constant INITIAL_NONCE = 1;
    string constant TYPEDDATAV4_PREFIX = "\x19\x01";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setUp() public {
        (s_minter, s_minterPk) = makeAddrAndKey("MINTER");

        // Token Deploy
        DemoTokenScript tokenDeployer = new DemoTokenScript();
        s_token = tokenDeployer.run();

        // Bridge Deploy
        IBC_BridgeScript bridgeDeployer = new IBC_BridgeScript();
        s_bridge = bridgeDeployer.run();
        
        s_bridge.setToken(s_token);
        s_bridge.setMinter(s_minter);
        s_token.changeMinter(address(s_bridge), true);
    }

    function testCorrectInitialization() public view {
        string memory name = s_bridge.getName();
        string memory version = s_bridge.getVersion();
        address minter = s_bridge.s_minter();
        address tokenAddress = address(s_bridge.s_token());

        assertEq(name, BRIDGE_NAME);
        assertEq(version, BRIDGE_VERSION);
        assertEq(minter, s_minter);
        assertEq(tokenAddress, address(s_token));
    }

    function testCorrectDomainHash() public view {
        // Calculate correct domain hash
        bytes32 nameHash = keccak256(bytes(BRIDGE_NAME));
        bytes32 versionHash = keccak256(bytes(BRIDGE_VERSION));
        bytes32 domainHash = s_bridge.buildDomainHash(
            nameHash,
            versionHash,
            block.chainid,
            s_minter
        );

        // Get actual domain hash
        bytes32 actualDomain = s_bridge.getCurrentDomainHash();

        assertEq(domainHash, actualDomain);
    }

    function testBuildStructHash() public view {
        bytes32 structTypeHash = 
            keccak256(
                abi.encodePacked("Transaction(address receiver,uint256 receivingChainId,uint256 amount, uint256 nonce)")
            );
        
        bytes memory encoding = abi.encode(structTypeHash, i_receiver, i_chain, BRIDGE_AMOUNT, INITIAL_NONCE);
        bytes32 correctHash = keccak256(encoding);
        bytes32 actualHash = s_bridge.buildStructHash(i_receiver, i_chain, BRIDGE_AMOUNT, INITIAL_NONCE);

        assertEq(correctHash, actualHash);
    }

    function testSignatureVerification() public view {
        bytes32 domainHash = s_bridge.getDomainHash(i_chain);
        bytes32 structHash = s_bridge.buildStructHash(i_receiver, i_chain, BRIDGE_AMOUNT, INITIAL_NONCE);
        bytes32 digestHash = keccak256(abi.encodePacked(TYPEDDATAV4_PREFIX, domainHash, structHash));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(s_minterPk, digestHash);
        address signer = ecrecover(digestHash, v, r, s);
        assertEq(signer, s_minter);
    }

    function testAdminCanRegisterDomain() public {
        // Check other chain domain status
        bytes32 domainHash = s_bridge.getDomainHash(i_otherChain);
        assertEq(domainHash, 0);

        // Execute change
        vm.prank(i_admin);
        s_bridge.registerDomain(BRIDGE_NAME, BRIDGE_VERSION, i_otherChain, s_minter);

        // Check updated status
        domainHash = s_bridge.getDomainHash(i_otherChain);
        assertNotEq(domainHash, 0);
    }

    function testAdminCanChangeDomainData() public  {
        // Domain must be already registered
        vm.prank(i_admin);
        s_bridge.registerDomain(BRIDGE_NAME, BRIDGE_VERSION, i_otherChain, s_minter);

        // Check domain hash before change
        bytes32 domainHashBefore = s_bridge.getDomainHash(i_otherChain);

        // Execute change by changing verifier to random account
        vm.prank(s_admin);
        s_bridge.changeDomain(BRIDGE_NAME, BRIDGE_VERSION, i_otherChain, i_user);

        // Check domain hash after change
        bytes32 domainHashAfter = s_bridge.getDomainHash(i_otherChain);
        assertNotEq(domainHashBefore, domainHashAfter);
    }

    function testRevertInvalidDomainChange() public {
        vm.startPrank(i_admin);

        // Cannot register domain for host chain id
        vm.expectRevert(abi.encodeWithSelector(EIP712X.EIP712X__InvalidChain.selector, i_chain));
        s_bridge.registerDomain(BRIDGE_NAME, BRIDGE_VERSION, i_chain, s_minter);

        // Cannot change domain for host chain id
        vm.expectRevert(abi.encodeWithSelector(EIP712X.EIP712X__InvalidChain.selector, i_chain));
        s_bridge.changeDomain(BRIDGE_NAME, BRIDGE_VERSION, i_chain, s_minter);

        // Cannot change non-existing domain. Domain for i_otherChain does not exist yet.
        vm.expectRevert(EIP712X.EIP712X__InvalidDomain.selector);
        s_bridge.changeDomain(BRIDGE_NAME, BRIDGE_VERSION, i_otherChain, s_minter);

        // Cannot re-register existing domain
        s_bridge.registerDomain(BRIDGE_NAME, BRIDGE_VERSION, i_otherChain, s_minter);
        vm.expectRevert(EIP712X.EIP712X__DomainAlreadyRegistered.selector);
        s_bridge.registerDomain(BRIDGE_NAME, BRIDGE_VERSION, i_otherChain, s_minter);

        vm.stopPrank();
    }

    function testRevertUnauthorizedDomainChange() public {

        // Non admin cannot register domain
        vm.expectRevert();
        vm.prank(i_notAdmin);
        s_bridge.registerDomain(BRIDGE_NAME, BRIDGE_VERSION, i_otherChain, s_minter);

        // Non admin cannot change domain
        vm.prank(i_admin);
        s_bridge.registerDomain(BRIDGE_NAME, BRIDGE_VERSION, i_otherChain, s_minter);

        vm.expectRevert();
        vm.prank(i_notAdmin);
        s_bridge.changeDomain(BRIDGE_NAME, BRIDGE_VERSION, i_otherChain, i_user);
    }

    function testSendingData() public {
        // Set up registration and user funding
        vm.prank(i_admin);
        s_bridge.registerDomain(BRIDGE_NAME, BRIDGE_VERSION, i_otherChain, s_minter);
        vm.prank(s_minter);
        s_token.mintTo(i_user, TOKEN_AMOUNT);

        // Send data and tokens
        uint256 userTokens = s_token.balanceOf(i_user);
        assertEq(userTokens, TOKEN_AMOUNT);

        vm.prank(i_user);
        vm.expectEmit(true, false, false, true);
        s_bridge.dataSend(i_receiver, TOKEN_AMOUNT, i_otherChain);

        userTokens = s_token.balanceOf(i_user);
        assertEq(userTokens, 0);
    }

    function testReceivingData() public {
        // Register sender domain
        vm.prank(i_admin);
        s_bridge.registerDomain(BRIDGE_NAME, BRIDGE_VERSION, i_otherChain, s_minter);

        // Create mock mint request from other chain
        address receiver = i_user;
        uint256 receivingChain = i_chain;
        uint256 amount = TOKEN_AMOUNT;
        uint256 nonce = 0;

        // Sign by minter. Signature must be made for the receiver's domain separator
        bytes32 structHash  = s_bridge.buildStructHash(receiver, receivingChain, amount, nonce);
        bytes32 digest = s_bridge.getPrefixedDataHash(structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(s_minterPk, digest);
        bytes memory signature = abi.encodePacked(v, r, s);

        // User balance before
        uint256 balance = s_token.balanceOf(i_user);
        assertEq(balance, 0);

        // Send to bridge by user for validation and minting
        s_bridge.dataReceive(i_user, i_otherChain, TOKEN_AMOUNT, signature);

        // User balance after
        balance = s_token.balanceOf(i_user);
        assertEq(balance, TOKEN_AMOUNT);
    }
}