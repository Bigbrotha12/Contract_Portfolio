// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title IBC_Bridge
/// @author Rafael Mendoza
/// @notice Specific implementation of EIP712 and on-chain signature verification to
/// @notice ensure transaction validity and uniqueness. EIP712 definition is too
/// @notice generic and must be extended to specific application needs.
/// @dev  IBC_Bridge Message Struct:
/// @dev  {
/// @dev    type: "\x19Ethereum Signed Message:\n32",
/// @dev    message: {
/// @dev      domain: {
/// @dev        type: EIP712Domain,
/// @dev        name: string,
/// @dev        version: string,
/// @dev        chainId: uint256,
/// @dev        verifyingContract: address
/// @dev      }
/// @dev      struct: {
/// @dev        type: Transaction,
/// @dev        receiver: address,
/// @dev        receivingChainId: uint256,
/// @dev        tokenId: uint256,
/// @dev        nonce: uint256
/// @dev      }
/// @dev    }
/// @dev  }
abstract contract EIP712X is EIP712, Ownable {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    bytes32 public immutable i_typeHash;
    mapping(uint256 chainId => bytes32 domainHash) public s_validDomainHash;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 ERRORS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    error EIP712X__InvalidChain(uint256 chainId);
    error EIP712X__DomainAlreadyRegistered();
    error EIP712X__InvalidDomain();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    constructor(bytes32 _typeHash) {
        i_typeHash = _typeHash;
    }

    /// @notice Registers a new domain to receive data from other chains.
    /// @dev Called by contract owner to add new chain as data recipient. Prevents
    /// @dev accidental domain change by requiring domain hash to be uninitialized.
    /// @param _name Foreign bridge name
    /// @param _version Foreign bridge version
    /// @param _chainId Host blockchain ID
    /// @param _verifier Address of foreign bridge contract
    function registerDomain(
        string memory _name,
        string memory _version,
        uint256 _chainId,
        address _verifier
    ) 
    external 
    onlyOwner 
    returns (bool) 
    {
        if(_chainId == block.chainid) revert EIP712X__InvalidChain(_chainId);
        if(getDomainHash(_chainId) != 0) revert EIP712X__DomainAlreadyRegistered();

        bytes32 nameHash = keccak256(bytes(_name));
        bytes32 versionHash = keccak256(bytes(_version));
        bytes32 domainHash = buildDomainHash(
            nameHash,
            versionHash,
            _chainId,
            _verifier
        );
        s_validDomainHash[_chainId] = domainHash;

        emit DomainRegistered(_name, _version, _chainId, _verifier);
        return true;
    }

    /// @notice Changes an existing domain to receiving data from other chains.
    /// @dev Called by contract owner to change or upgrade existing bridge contract.
    /// @dev Prevents accidental domain creation by requiring domain hash to be initialized.
    /// @param _name dApp name
    /// @param _version dApp version
    /// @param _chainId Host blockchain ID.
    /// @param _verifier Address of dApp contract.
    function changeDomain(
        string memory _name,
        string memory _version,
        uint256 _chainId,
        address _verifier
    ) 
    external 
    onlyOwner 
    returns (bool) 
    {
        if (_chainId == block.chainid) revert EIP712X__InvalidChain(_chainId);
        if (getDomainHash(_chainId) == 0) revert EIP712X__InvalidDomain();

        bytes32 nameHash = keccak256(bytes(_name));
        bytes32 versionHash = keccak256(bytes(_version));
        bytes32 domainHash = buildDomainHash(
            nameHash,
            versionHash,
            _chainId,
            _verifier
        );
        s_validDomainHash[_chainId] = domainHash;

        emit DomainChanged(_name, _version, _chainId, _verifier);
        return true;
    }

    /// @notice Returns the valid domain hash for an existing domain.
    /// @param _chainId ID of target chain
    function getDomainHash(uint256 _chainId) public view returns (bytes32) {
        return s_validDomainHash[_chainId];
    }

    /// @notice Returns the valid domain hash for this contract.
    function getCurrentDomainHash() public view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /// @notice Returns message digest to be used for signature verification.
    /// @param _structHash EIP712 typed structured message hash
    function getPrefixedDataHash(
        bytes32 _structHash
    ) 
    public 
    view 
    returns (bytes32) 
    {
        return _prefixedHashTypedDataV4(_structHash);
    }

    /// @notice Returns message digest to be used for signing.
    /// @param _structHash EIP712 typed structured message hash
    function getTypedDataHash(
        bytes32 _structHash
    ) 
    public 
    view 
    returns (bytes32) 
    {
        return _hashTypedDataV4(_structHash);
    }

    /// @notice Calculates typed structured message hash.
    /// @param _receiver Address of the receiving account on the destination blockchain.
    /// @param _receivingChainId ID of the destination blockchain.
    /// @param _amount amount of tokens to be minted on destination blockchain.
    /// @param _nonce transaction number.
    function buildStructHash(
        address _receiver,
        uint256 _receivingChainId,
        uint256 _amount,
        uint256 _nonce
    ) 
    public 
    view 
    returns (bytes32) 
    {
        return
            _buildStructHash(
                i_typeHash,
                _receiver,
                _receivingChainId,
                _amount,
                _nonce
            );
    }

    /// @notice Returns a domain hash per EIP712.
    /// @param _name Hashed bridge name
    /// @param _version Hashed bridge version
    /// @param _chainId Host blockchain ID.
    /// @param _verifier Address of bridge contract.
    function buildDomainHash(
        bytes32 _name,
        bytes32 _version,
        uint256 _chainId,
        address _verifier
    ) 
    public 
    pure 
    returns (bytes32) 
    {
        return _buildDomainSeparator(_name, _version, _chainId, _verifier);
    }

    function _prefixedHashTypedDataV4(
        bytes32 _structHash
    ) 
    internal 
    view 
    virtual 
    returns (bytes32) 
    {
        return _hashTypedDataV4(_structHash);
    }

    function _buildDomainSeparator(
        bytes32 name,
        bytes32 version,
        uint256 chainId,
        address receivingContract
    ) 
    internal 
    pure 
    returns (bytes32) 
    {
        bytes32 typeHash = keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );
        return keccak256(abi.encode(typeHash, name, version, chainId, receivingContract));
    }

    function _buildStructHash(
        bytes32 _typeHash,
        address _receiver,
        uint256 _receivingChainId,
        uint256 _amount,
        uint256 _nonce
    ) 
    internal 
    pure 
    returns (bytes32) 
    {
        return keccak256(abi.encode(_typeHash,_receiver,_receivingChainId,_amount,_nonce));
    }
}
