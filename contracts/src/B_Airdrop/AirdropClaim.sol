// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol"; 
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title AirdropClaim
/// @author Rafael Mendoza
/// @notice Allows user to claim ERC20 token if part of Merkle Tree within owner-specified deadline.
contract AirdropClaim {
  using SafeERC20 for IERC20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  IERC20 public immutable i_airdropToken;
  bytes32 public s_merkleRoot;
  address public s_owner;
  uint256 public s_deadline;
  mapping(address user => bool claimed) public hasClaimed;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  event Claimed(address indexed to, uint256 amount);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 ERRORS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  error AirdropClaim__Unathorized(address unathorized);
  error AirdropClaim__AlreadyClaimed(address user);
  error AirdropClaim__ActiveAirdrop();
  error AirdropClaim__ExpiredAirdrop();
  error AirdropClaim__InvalidProof();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                MODIFIERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  modifier OnlyOwner {
    if(msg.sender != s_owner) revert AirdropClaim__Unathorized(msg.sender);
    _;
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /// @notice Creates a new AirdropClaim contract
  /// @param _merkleRoot of claimees
  /// @param _tokenAddress address of token to be airdropped
  /// @param _deadline number of blocks airdrop will be active
  constructor(bytes32 _merkleRoot, address _tokenAddress, uint256 _deadline) {
    s_merkleRoot = _merkleRoot;                
    i_airdropToken = IERC20(_tokenAddress);   
    s_deadline = block.number + _deadline;  
    s_owner = msg.sender;                     
  }

  /// @notice Allows user to claim token if address is part of merkle tree
  /// @dev A valid claim should revert if contract has insufficient funds
  /// @param _to address of claimee
  /// @param _amount number of tokens owed to claimee
  /// @param _proof merkle proof to prove address and amount are in tree
  function claim(address _to, uint256 _amount, bytes32[] calldata _proof) external {
    if(hasClaimed[_to]) revert AirdropClaim__AlreadyClaimed(_to);
    if(block.number > s_deadline) revert AirdropClaim__ExpiredAirdrop();

    // Verify merkle proof
    bytes32 leaf = keccak256(abi.encodePacked(_to, _amount));
    bool isValidLeaf = MerkleProof.verify(_proof, s_merkleRoot, leaf);
    if(!isValidLeaf) revert AirdropClaim__InvalidProof();

    // Send tokens to claimee
    hasClaimed[_to] = true;
    i_airdropToken.safeTransfer(_to, _amount);
    emit Claimed(_to, _amount);
  }

  /// @notice Allows token deployer to deposit ERC20 token to be airdropped
  /// @dev Airdrop contract must be funded prior to claiming
  /// @param _amount number of tokens to be deposited
  function depositERC20(uint256 _amount) external {
    i_airdropToken.safeTransferFrom(msg.sender, address(this), _amount);
  }
  
  /// @notice Allows owner to recover unclaimed ERC20 tokens deposited to contract after airdrop deadline.
  function recoverERC20() external OnlyOwner() {
    if(block.number < s_deadline) revert AirdropClaim__ActiveAirdrop();

    uint256 recoverBalance  = i_airdropToken.balanceOf(address(this));
    i_airdropToken.safeTransfer(msg.sender, recoverBalance);
  }
}