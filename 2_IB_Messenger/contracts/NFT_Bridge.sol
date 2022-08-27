// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ECDSA.sol";
import "./EIP712.sol";
import "./Ownable.sol";

contract NFT_Bridge is EIP712, Ownable {
    using ECDSA for bytes32;

    //-------------------------- GLOBAL VARIABLES ----------------------------------

    /// @notice Nonce tracks number of cross-chain transactions per each
    /// sending blockchain.
    /// @dev Allows dapp to determine pending 'receive' transaction for each
    /// user and allow them to complete data bridging. Nonce for any given
    /// sending/receiving chain pair should be equal on both chains if data
    /// transfer completed succesfully.
    /// param address         Address of bridge user.
    /// param uint256         Chain ID of origin chain.
    /// param uint256         Chain ID of destination chain.
    mapping(address => mapping(uint256 => mapping(uint256 => uint256))) public _nonce;
    mapping(uint256 => bytes32) private _validDomainHash;
    bytes32 private immutable _MESSAGE_TYPE_HASH;
    address private constant _MINTER = 0xa8EFf2779ffb1BdBDA9eAAa04900e3AE18752301;

    //------------------------------- EVENTS ---------------------------------------

    event DataSent(
      address indexed receiver, 
      uint256 tokenId, 
      uint256 receivingChainId, 
      uint256 nonce, 
      bytes32 domainSeparator
    );
    event DataReceived(
      address indexed receiver, 
      uint256 tokenId, 
      uint256 sendingChainId, 
      uint256 nonce
    );
    event DomainRegistered(
      string indexed name, 
      string indexed version, 
      uint256 chainId, 
      address targetContract
    );
    event DomainChanged(
      string indexed name, 
      string indexed version, 
      uint256 chainId, 
      address targetContract
    );

    //------------------------------- CONSTRUCTOR ----------------------------------

    constructor() EIP712("NFT_Bridge", "1.0") {
      _MESSAGE_TYPE_HASH = keccak256(
        "Transaction(address receiver,uint256 tokenId,uint256 receivingChainId,uint256 nonce)"
      );
    }

    //------------------------------ VIEW FUNCTIONS --------------------------------

    /// @notice Obtains the valid domain hash for an existing domain.
    /// @param chainId           ID of target chain
    /// @return bytes32          Returns typed domain hash for 'chainId'.
    function getDomainHash(uint256 chainId) public view returns (bytes32) {
      return _validDomainHash[chainId];
    }

    /// @notice Obtains the valid domain hash for this contract.
    /// @return bytes32          Returns typed domain hash.
    function getCurrentDomainHash() public view returns (bytes32) {
      return _domainSeparatorV4();
    }

    /// @notice Calculates a domain hash per EIP712.
    /// @param name              Hashed Dapp name
    /// @param version           Hashed Dapp version
    /// @param chainId           Host blockchain ID.
    /// @param verifyingContract Address of Dapp contract.
    /// @return bytes32          Returns domain separator hash.
    function buildDomainHash(
      bytes32 name, 
      bytes32 version, 
      uint256 chainId, 
      address verifyingContract
    ) public view returns (bytes32) {
      return _buildDomainSeparator(name, version, chainId, verifyingContract);
    }

    /// @notice Calculates typed structured message hash.
    /// @param receiver          Address of the receiving account on the destination blockchain.
    /// @param tokenId           ID number of the NFT collection to be minted on destination blockchain.
    /// @param receivingChainId  ID of the destination blockchain.
    /// @param nonce             Transaction number.
    /// @return bytes32          Returns typed message hash.
    function buildStructHash(
      address receiver, 
      uint256 tokenId,
      uint256 receivingChainId,
      uint256 nonce
    ) public view returns (bytes32) {
      return _buildStructHash(_MESSAGE_TYPE_HASH, receiver, tokenId, receivingChainId, nonce);
    }

    /// @notice Calculates message digest to be used for signing.
    /// @param domainHash        EIP712 domain separator hash
    /// @param structHash        EIP712 typed structured message hash
    /// @return bytes32          Returns the digest for signing.
    function getTypedDataHash(
      bytes32 domainHash, 
      bytes32 structHash
    ) public pure returns (bytes32) {
      return _hashTypedDataV4(domainHash, structHash);
    }

    /// @notice Calculates message digest to be used for signature verification.
    /// @param domainHash        EIP712 domain separator hash
    /// @param structHash        EIP712 typed structured message hash
    /// @return bytes32          Returns the digest for verification.
    function getPrefixedDataHash(
      bytes32 domainHash, 
      bytes32 structHash
    ) public pure returns (bytes32) {
      return _prefixedHashTypedDataV4(domainHash, structHash);
    }

    //------------------------- MUTATIVE FUNCTIONS ---------------------------------

    /// @notice Initiates data bridge to another chain.
    /// @dev Captures the user request data to be relayed to another blockchain. 
    /// Data is captured by relayer via emitted event. Domain hash needs to match 
    /// domain for receiving chain, NOT this contract's domain.
    /// @param receiver          Address of the receiving account.
    /// @param tokenId           ID number of the NFT collection to be minted.
    /// @param receivingChainId  ID of the destination blockchain.
    function dataSend(
      address receiver, 
      uint256 tokenId, 
      uint256 receivingChainId
    ) external returns (bool) {
        bytes32 destinationDomain = getDomainHash(receivingChainId);
        require(destinationDomain != 0, "ERROR: Unregistered Domain");

        uint256 nonce = _nonce[msg.sender][block.chainid][receivingChainId]++;
        
        emit DataSent(receiver, tokenId, receivingChainId, nonce, destinationDomain);
        return true;
    }

    /// @notice Validates the transaction data and verifies signature before 
    /// executing NFT minting.
    /// @dev The message hash must be computed on-chain based on parameter 
    /// input to verify that provided parameters have not been tampered and 
    /// signature has not been reused.
    /// @param receiver          Address of the receiving account.
    /// @param tokenId           ID number of the NFT collection to be minted.
    /// @param sendingChainId    ID of the origin chain.
    /// @param signature         Signature for verification.
    function dataReceive(
      address receiver, 
      uint256 tokenId, 
      uint256 sendingChainId, 
      bytes calldata signature
    ) external returns (bool) {
      uint256 nonce = _nonce[msg.sender][sendingChainId][block.chainid]++;
      bytes32 domainHash = getCurrentDomainHash();
      bytes32 structHash = buildStructHash(receiver, tokenId, block.chainid, nonce);
      bytes32 digest = getPrefixedDataHash(domainHash, structHash);
      address signer = digest.recover(signature);
      require(signer == _MINTER, "ERROR: Signature Verification Failed");
  
      emit DataReceived(receiver, tokenId, sendingChainId, nonce);
      return true;
    }

    //----------------------------- RESTRICTED FUNCTIONS ---------------------------

    /// @notice Registers a new domain hash to receive data from other chains.
    /// @dev Called by contract owner to add new chain as data recipient. Prevents 
    /// accidental domain change by requiring domain hash to be uninitialized.
    /// @param name              Dapp name
    /// @param version           Dapp version
    /// @param chainId           Host blockchain ID.
    /// @param verifyingContract Address of Dapp contract.
    function registerDomain(
      string memory name, 
      string memory version, 
      uint256 chainId, 
      address verifyingContract
    ) external onlyOwner returns (bool) {
      require(getDomainHash(chainId) == 0, "ERROR: Domain already exist");
      
      bytes32 nameHash = keccak256(bytes(name));
      bytes32 versionHash = keccak256(bytes(version));
      bytes32 domainHash = buildDomainHash(nameHash, versionHash, chainId, verifyingContract);
      _validDomainHash[chainId] = domainHash;

      emit DomainRegistered(name, version, chainId, verifyingContract);
      return true;
    }
    
    /// @notice Changes an existing domain hash to receiving data from other chains.
    /// @dev Called by contract owner to change or upgrade existing bridge contract. 
    /// Prevents accidental domain creation by requiring domain hash to be initialized.
    /// @param name              Dapp name
    /// @param version           Dapp version
    /// @param chainId           Host blockchain ID.
    /// @param verifyingContract Address of Dapp contract.
    function changeDomain(
      string memory name, 
      string memory version, 
      uint256 chainId, 
      address verifyingContract
    ) external onlyOwner returns (bool) {
      require(getDomainHash(chainId) != 0, "ERROR: Domain does not exist");

      bytes32 nameHash = keccak256(bytes(name));
      bytes32 versionHash = keccak256(bytes(version));
      bytes32 domainHash = buildDomainHash(nameHash, versionHash, chainId, verifyingContract);
      _validDomainHash[chainId] = domainHash;

      emit DomainChanged(name, version, chainId, verifyingContract);
      return true;
    }
}
