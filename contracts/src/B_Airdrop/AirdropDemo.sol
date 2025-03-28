// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {DemoToken} from "./../A_ERC20/DemoToken.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title AirdropDemo
/// @author Rafael Mendoza
/// @notice Allows user to claim ERC20 token if part of Merkle Tree within owner-specified deadline.
contract AirdropDemo is Ownable {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    DemoToken public s_demoToken;
    uint256 public s_limit;
    mapping(address sponsor => mapping(address user => bool status)) public s_hasClaimed;
    mapping(address sponsor => bytes32 root) public s_merkleRoot;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    event Claimed(address indexed to, uint256 amount);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 ERRORS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    error AirdropDemo__Unathorized(address unathorized);
    error AirdropDemo__AlreadyClaimed(address user);
    error AirdropDemo__InsufficientFunds(uint256 claim, uint256 limit);
    error AirdropDemo__InvalidProof();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /// @notice Creates a new AirdropDemo contract.
    /// @param _limit maximum amount of token to airdrop per-transaction.
    /// @param _token address of DemoToken contract to be used for minting. 
    constructor(uint256 _limit, DemoToken _token) Ownable(msg.sender) {
        s_demoToken = _token;
        s_limit = _limit;
    }

    /// @notice Creates a new Airdrop merkle root. Security checks are disabled for Demo.
    /// @param _root Merkle root of airdrop data.
    function createAirdrop(bytes32 _root) external {
        s_merkleRoot[msg.sender] = _root;
    }

    /// @notice Changes airdrop token to be distributed.
    /// @param _token new token contract.
    function setToken(DemoToken _token) external onlyOwner() {
        s_demoToken = _token;
    }

    /// @notice Allows user to claim token if address is part of merkle tree
    /// @dev A valid claim should revert if contract has insufficient funds
    /// @param _to address of claimee
    /// @param _amount number of tokens owed to claimee
    /// @param _proof merkle proof to prove address and amount are in tree
    function claim(address _creator, address _to, uint256 _amount, bytes32[] calldata _proof) external {
        if(s_hasClaimed[_creator][_to]) revert AirdropDemo__AlreadyClaimed(msg.sender);
        if(_amount > s_limit) revert AirdropDemo__InsufficientFunds(_amount, s_limit);

        bytes32 leaf = keccak256(abi.encodePacked(_to, _amount));
        bool isValidLeaf = MerkleProof.verify(
            _proof,
            s_merkleRoot[_creator],
            leaf
        );
        if (!isValidLeaf) revert AirdropDemo__InvalidProof();

        s_hasClaimed[_creator][_to] = true;
        s_demoToken.mintTo(_to, _amount);

        emit Claimed(_to, _amount);
    }
}
