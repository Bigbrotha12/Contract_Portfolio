// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./EIP712X.sol";
import "./../A_DemoToken/DemoToken.sol";

/// @title IBC_Bridge
/// @notice Implementing EIP712 and on-chain signature verification to
/// @notice ensure transaction validity and uniqueness. This specific implementation
/// @notice handles cross-chain NFT minting requests.
/// @dev Allows dapp to determine pending 'receive' transaction for each
/// @dev user and allow them to complete data bridging. Nonce for any given
/// @dev sending/receiving chain pair should be equal on both chains if data
/// @dev transfer completed succesfully.
contract IBC_Bridge is EIP712X {
    using ECDSA for bytes32;

    //------------------ STATE VARIABLES ---------------------------------------

    address public immutable MINTER;
    mapping(address => mapping(uint256 => mapping(uint256 => uint256)))
        public nonce;
    DemoToken public demoToken;
    string public name;
    string public version;

    //----------------------- EVENTS -------------------------------------------

    event DataSent(
        address indexed receiver,
        uint256 amount,
        uint256 receivingChainId,
        uint256 nonce,
        bytes32 domainSeparator
    );
    event DataReceived(
        address indexed receiver,
        uint256 amount,
        uint256 sendingChainId,
        uint256 nonce
    );

    //--------------------  CONSTRUCTOR ----------------------------------------

    /// @notice Initializes bridge endpoint contract with given name and version.
    /// @param _name of current contract
    /// @param _version of contract being deployed.
    /// @param _minter approved Oracle relayer address.
    /// @param _token demo token for bridging.
    constructor(
        string memory _name,
        string memory _version,
        address _minter,
        DemoToken _token
    ) EIP712(_name, _version) {
        MESSAGE_TYPE_HASH = keccak256(
            "Transaction(address receiver,uint256 receivingChainId,uint256 amount, uint256 nonce)"
        );
        MINTER = _minter;
        name = _name;
        version = _version;
        demoToken = _token;
    }

    //-------------------- VIEW FUNCTIONS ----------------------------------

    /// @notice Returns contract's current chain.
    function getChainId() public view returns (uint256) {
        return block.chainid;
    }

    /// @notice Returns contract address.
    function getAddress() public view returns (address) {
        return address(this);
    }

    /// @notice Returns the contract's domain name.
    function getName() public view returns (string memory) {
        return name;
    }

    /// @notice Returns the version of deployed contract.
    function getVersion() public view returns (string memory) {
        return version;
    }

    //-------------------- MUTATIVE FUNCTIONS ----------------------------------

    /// @notice Allows contract owner to change Demo Token to be used for test.
    /// @param _token address of new token conforming to the DemoToken interface.
    function setToken(DemoToken _token) external {
        require(msg.sender == owner(), "IBC_Bridge: Unauthorized.");
        demoToken = _token;
    }

    /// @notice Initiates data bridge to another chain.
    /// @dev Captures the user request data to be relayed to another blockchain.
    /// @dev Data is captured by relayer via emitted event. Domain hash needs to match
    /// @dev domain for receiving chain, NOT this contract's domain.
    /// @param _receiver Address of the receiving account.
    /// @param _amount Amount of tokens to be sent.
    /// @param _receivingChainId ID of the destination blockchain.
    function dataSend(
        address _receiver,
        uint256 _amount,
        uint256 _receivingChainId
    ) external returns (bool) {
        bytes32 destinationDomain = getDomainHash(_receivingChainId);
        require(destinationDomain != 0, "IBC_Bridge: Unregistered Domain.");
        require(
            demoToken.balanceOf(msg.sender) >= _amount,
            "IBC_Bridge: Insufficient funds."
        );

        uint256 nonce_ = nonce[msg.sender][block.chainid][_receivingChainId]++;

        demoToken.burnFrom(msg.sender, _amount);
        emit DataSent(
            _receiver,
            _amount,
            _receivingChainId,
            nonce_,
            destinationDomain
        );
        return true;
    }

    /// @notice Validates the transaction data and verifies signature before
    /// @notice executing minting.
    /// @dev The message hash must be computed on-chain based on parameter
    /// @dev input to verify that provided parameters have not been tampered and
    /// @dev signature has not been reused.
    /// @param _receiver Address of receiving account.
    /// @param _sendingChainId ID of the origin chain.
    /// @param _amount Amount of tokens transferred.
    /// @param _signature Signature for verification.
    function dataReceive(
        address _receiver,
        uint256 _sendingChainId,
        uint256 _amount,
        bytes calldata _signature
    ) external returns (bool) {
        uint256 nonce_ = nonce[msg.sender][_sendingChainId][block.chainid]++;
        bytes32 structHash = buildStructHash(
            _receiver,
            block.chainid,
            _amount,
            nonce_
        );

        bytes32 digest = getPrefixedDataHash(structHash);
        address signer = digest.toEthSignedMessageHash().recover(_signature);
        require(signer == MINTER, "ECDSA: Signature Verification Failed.");

        demoToken.mintTo(_receiver, _amount);
        emit DataReceived(_receiver, _amount, _sendingChainId, nonce_);
        return true;
    }
}
