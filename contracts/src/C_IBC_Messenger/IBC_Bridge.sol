// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {EIP712X} from "./EIP712X.sol";
import {DemoToken} from "./../A_ERC20/DemoToken.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title IBC_Bridge
/// @author Rafael Mendoza
/// @notice Implementing EIP712 and on-chain signature verification to ensure transaction validity and uniqueness. 
/// @notice This specific implementation handles cross-chain NFT minting requests.
/// @dev Allows dapp to determine pending 'receive' transaction for each user and allow them to complete data bridging. 
/// @dev Nonce for any given chain pair should be equal on both chains if data transfer completed succesfully.
contract IBC_Bridge is EIP712X {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    address public s_minter;
    mapping(address user => mapping(uint256 senderChain => mapping(uint256 receiverChain => uint256 nonce))) 
        public s_nonce;
    DemoToken public s_token;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    event DataSent(
        address indexed receiver,
        uint256 amount,
        uint256 receivingChainId,
        uint256 nonce,
        bytes32 domainSeparator
    );
    event DataReceived(address indexed receiver,uint256 amount,uint256 sendingChainId,uint256 nonce);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 ERRORS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    error IBC_Bridge__Unathorized(address unathorized);
    error IBC_Bridge__InsufficientFunds(uint256 amount, uint256 required);
    error IBC_Bridge__WrongSignature();
    error IBC_Bridge__MissingToken();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                MODIFIERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  modifier Initialized() {
    if(s_token == DemoToken(address(0))) revert IBC_Bridge__MissingToken();
    _;
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /// @notice Initializes bridge endpoint contract with given name and version.
    /// @param _name name of current contract
    /// @param _version contract version being deployed.
    /// @param _admin address of contract owner
    constructor(
        string memory _name, 
        string memory _version,
        address _admin
    ) 
    EIP712(_name, _version)
    EIP712X(keccak256("Transaction(address receiver,uint256 receivingChainId,uint256 amount, uint256 nonce)"))
    Ownable(_admin)
    {
    }

    /// @notice Allows contract owner to change Demo Token to be used for test.
    /// @param _token address of new token conforming to the DemoToken interface.
    function setToken(DemoToken _token) external onlyOwner {
        s_token = _token;
    }

    /// @notice Allows contract owner to set verifier.
    /// @param _minter address of new minter.
    function setMinter(address _minter) external onlyOwner {
        s_minter = _minter;
    }

    /// @notice Initiates data bridge to another chain.
    /// @dev Captures the user request data to be relayed to another blockchain. Data is captured by relayer via 
    /// @dev emitted event. Domain hash needs to match domain for receiving chain, NOT this contract's domain.
    /// @param _receiver Address of the receiving account.
    /// @param _amount Amount of tokens to be sent.
    /// @param _receivingChainId ID of the destination blockchain.
    function dataSend(address _receiver, uint256 _amount, uint256 _receivingChainId) external returns (bool) {
        bytes32 destinationDomain = getDomainHash(_receivingChainId);
        if(destinationDomain == 0) revert EIP712X__InvalidDomain();

        uint256 balance = s_token.balanceOf(msg.sender);
        if(balance < _amount) revert IBC_Bridge__InsufficientFunds(balance, _amount);

        uint256 nonce = s_nonce[msg.sender][block.chainid][_receivingChainId]++;

        s_token.burnFrom(msg.sender, _amount);
        
        emit DataSent(_receiver, _amount, _receivingChainId, nonce, destinationDomain);
        return true;
    }

    /// @notice Validates the transaction data and verifies signature before executing minting.
    /// @dev The message hash must be computed on-chain based on parameter input to verify that provided parameters
    /// @dev have not been tampered and signature has not been reused.
    /// @param _receiver Address of receiving account.
    /// @param _sendingChainId ID of the origin chain.
    /// @param _amount Amount of tokens transferred.
    /// @param _signature Signature for verification.
    function dataReceive(
        address _receiver, 
        uint256 _sendingChainId, 
        uint256 _amount, 
        bytes calldata _signature
    ) 
    external 
    returns (bool) 
    {
        uint256 nonce = s_nonce[msg.sender][_sendingChainId][block.chainid]++;
        bytes32 structHash = buildStructHash(_receiver, block.chainid, _amount, nonce);
        bytes32 digest = getPrefixedDataHash(structHash);
        address signer = digest.toEthSignedMessageHash().recover(_signature);
        
        if(signer != s_minter) revert IBC_Bridge__WrongSignature();

        s_token.mintTo(_receiver, _amount);
        emit DataReceived(_receiver, _amount, _sendingChainId, nonce);
        return true;
    }

    /// @notice Returns contract's current chain.
    function getChainId() public view returns (uint256) {
        return block.chainid;
    }

    /// @notice Returns the contract's domain name.
    function getName() public view returns (string memory) {
        return _EIP712Name();
    }

    /// @notice Returns the version of deployed contract.
    function getVersion() public view returns (string memory) {
        return _EIP712Version();
    }    
}
