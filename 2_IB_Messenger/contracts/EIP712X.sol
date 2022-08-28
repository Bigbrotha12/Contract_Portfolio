// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "Contract_Portfolio/node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "Contract_Portfolio/node_modules/@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "Contract_Portfolio/node_modules/@openzeppelin/contracts/access/Ownable.sol";

/// @title IBC_Bridge
/// @notice Specific implementation of EIP712 and on-chain signature verification to
/// @notice ensure transaction validity and uniqueness. EIP712 definition is too 
/// @notice generic and must be extended to specific application needs.
abstract contract EIP712X is EIP712 {

    //------------------ STATE VARIABLES ---------------------------------------
    
    mapping(uint256 => bytes32) public _validDomainHash;
    bytes32 public immutable _MESSAGE_TYPE_HASH;
    address public immutable _MINTER = 0xa8EFf2779ffb1BdBDA9eAAa04900e3AE18752301;

    //----------------------- EVENTS -------------------------------------------

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

    //------------------------ VIEWS -------------------------------------------

    /// @notice Returns the valid domain hash for an existing domain.
    /// @param _chainId           ID of target chain
    function getDomainHash(uint256 _chainId) public view returns (bytes32) {
      return _validDomainHash[_chainId];
    }

    /// @notice Returns the valid domain hash for this contract.
    function getCurrentDomainHash() public view returns (bytes32) {
      return _domainSeparatorV4();
    }

    /// @notice Returns a domain hash per EIP712.
    /// @param _name              Hashed dApp name
    /// @param _version           Hashed dApp version
    /// @param _chainId           Host blockchain ID.
    /// @param _verifier          Address of dApp contract.
    function buildDomainHash(
      bytes32 _name, 
      bytes32 _version, 
      uint256 _chainId, 
      address _verifier
    ) public view returns (bytes32) {
      return _buildDomainSeparator(name, version, chainId, verifyingContract);
    }

    /// @notice Calculates typed structured message hash.
    /// @param _receiver          Address of the receiving account on the destination blockchain.
    /// @param _tokenId           ID number of the NFT collection to be minted on destination blockchain.
    /// @param _receivingChainId  ID of the destination blockchain.
    /// @param _nonce             Transaction number.
    function buildStructHash(
      address _receiver, 
      uint256 _tokenId,
      uint256 _receivingChainId,
      uint256 _nonce
    ) public view returns (bytes32) {
      return _buildStructHash(_MESSAGE_TYPE_HASH, _receiver, _tokenId, _receivingChainId, _nonce);
    }

    /// @notice Returns message digest to be used for signing.
    /// @param _domainHash        EIP712 domain separator hash
    /// @param _structHash        EIP712 typed structured message hash
    function getTypedDataHash(
      bytes32 _domainHash, 
      bytes32 _structHash
    ) public pure returns (bytes32) {
      return _hashTypedDataV4(_domainHash, _structHash);
    }

    /// @notice Returns message digest to be used for signature verification.
    /// @param _domainHash        EIP712 domain separator hash
    /// @param _structHash        EIP712 typed structured message hash
    function getPrefixedDataHash(
      bytes32 _domainHash, 
      bytes32 _structHash
    ) public pure returns (bytes32) {
      return _prefixedHashTypedDataV4(_domainHash, _structHash);
    }

    //----------------------------- RESTRICTED FUNCTIONS ---------------------------

    /// @notice Registers a new domain to receive data from other chains.
    /// @dev Called by contract owner to add new chain as data recipient. Prevents 
    /// @dev accidental domain change by requiring domain hash to be uninitialized.
    /// @param _name              dApp name
    /// @param _version           dApp version
    /// @param _chainId           Host blockchain ID.
    /// @param _verifer           Address of dApp contract.
    function registerDomain(
      string memory _name, 
      string memory _version, 
      uint256 _chainId, 
      address _verifier
    ) external onlyOwner returns (bool) {
      require(getDomainHash(chainId) == 0, "EIP712X: Domain already exist");
      
      bytes32 nameHash = keccak256(bytes(_name));
      bytes32 versionHash = keccak256(bytes(_version));
      bytes32 domainHash = buildDomainHash(nameHash, versionHash, _chainId, _verifier);
      _validDomainHash[_chainId] = domainHash;

      emit DomainRegistered(_name, _version, _chainId, _verifier);
      return true;
    }
    
    /// @notice Changes an existing domain to receiving data from other chains.
    /// @dev Called by contract owner to change or upgrade existing bridge contract. 
    /// @dev Prevents accidental domain creation by requiring domain hash to be initialized.
    /// @param _name              dApp name
    /// @param _version           dApp version
    /// @param _chainId           Host blockchain ID.
    /// @param _verifier          Address of dApp contract.
    function changeDomain(
      string memory _name, 
      string memory _version, 
      uint256 _chainId, 
      address _verifier
    ) external onlyOwner returns (bool) {
      require(getDomainHash(_chainId) != 0, "EIP712X: Domain does not exist");

      bytes32 nameHash = keccak256(bytes(_name));
      bytes32 versionHash = keccak256(bytes(_version));
      bytes32 domainHash = buildDomainHash(nameHash, versionHash, _chainId, _verifier);
      _validDomainHash[_chainId] = domainHash;

      emit DomainChanged(_name, _version, _chainId, _verifier);
      return true;
    }
}