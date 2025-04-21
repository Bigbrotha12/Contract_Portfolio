// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol"; 
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title AirdropClaim
/// @author Rafael Mendoza
/// @notice Allows user to claim ERC20 token if part of Merkle Tree within owner-specified deadline.
contract AirdropClaim is Ownable {
  using SafeERC20 for IERC20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  bytes32 public s_merkleRoot;
  address public s_owner;
  uint256 public s_deadline;
  IERC20 public s_token;
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
  error AirdropClaim__ZeroAddress();
  error AirdropClaim__MissingAirdropToken();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                MODIFIERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  modifier Initialized() {
    if(s_token == IERC20(address(0))) revert AirdropClaim__MissingAirdropToken();
    _;
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /// @notice Creates a new AirdropClaim contract
  /// @param _merkleRoot of claimees
  /// @param _deadline number of blocks airdrop will be active
  constructor(bytes32 _merkleRoot, uint256 _deadline) Ownable(msg.sender) {
    s_merkleRoot = _merkleRoot;                  
    s_deadline = block.number + _deadline;  
    s_owner = msg.sender;                     
  }

  /// @notice Allows user to claim token if address is part of merkle tree
  /// @dev A valid claim should revert if contract has insufficient funds
  /// @param _to address of claimee
  /// @param _amount number of tokens owed to claimee
  /// @param _proof merkle proof to prove address and amount are in tree
  function claim(address _to, uint256 _amount, bytes32[] calldata _proof) external Initialized {
    if(hasClaimed[_to]) revert AirdropClaim__AlreadyClaimed(_to);
    if(block.number > s_deadline) revert AirdropClaim__ExpiredAirdrop();

    // Verify merkle proof
    bytes32 leaf = keccak256(abi.encodePacked(_to, _amount));
    bool isValidLeaf = MerkleProof.verify(_proof, s_merkleRoot, leaf);
    if(!isValidLeaf) revert AirdropClaim__InvalidProof();

    // Send tokens to claimee
    hasClaimed[_to] = true;
    s_token.safeTransfer(_to, _amount);
    emit Claimed(_to, _amount);
  }

  /// @notice Allows token deployer to deposit ERC20 token to be airdropped
  /// @dev Airdrop contract must be funded prior to claiming
  /// @param _amount number of tokens to be deposited
  function depositERC20(uint256 _amount) external Initialized {
    s_token.safeTransferFrom(msg.sender, address(this), _amount);
  }

  function setAirdropToken(IERC20 _tokenAddress) external onlyOwner()  {
    if(_tokenAddress == IERC20(address(0))) revert AirdropClaim__ZeroAddress();

    s_token = _tokenAddress;
  }
  
  /// @notice Allows owner to recover unclaimed ERC20 tokens deposited to contract after airdrop deadline.
  function recoverERC20() external onlyOwner Initialized {
    if(block.number < s_deadline) revert AirdropClaim__ActiveAirdrop();

    uint256 recoverBalance  = s_token.balanceOf(address(this));
    s_token.safeTransfer(msg.sender, recoverBalance);
  }
}