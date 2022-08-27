// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol"; 
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; 

/// @title AirdropClaim
/// @notice Allows user to claim ERC20 token if part of Merkle Tree within
/// owner-specified deadline.
contract AirdropClaim {
  using SafeERC20 for IERC20;

  bytes32 public merkleRoot;
  address public owner;
  IERC20 public airdropToken;
  uint256 public deadline;
  mapping(address => bool) public hasClaimed;


  /// @notice Creates a new AirdropClaim contract
  // @param _merkleRoot of claimees
  // @param _tokenAddress address of token to be airdropped
  // @param _deadline number of blocks airdrop will be active
  constructor(bytes32 _merkleRoot, address _tokenAddress, uint256 _deadline) {
    merkleRoot = _merkleRoot; //_merkleRoot;               // Updates Merkle root
    airdropToken = IERC20(_tokenAddress);   // Sets airdrop token
    deadline = block.number + _deadline;     // Sets deadline for claiming
    owner = msg.sender;                     // Sets owner
  }

  event Claimed(address indexed to, uint256 amount);

  /// @notice Allows user to claim token if address is part of merkle tree
  /// @dev A valid claim should revert if contract has insufficient funds
  /// @param to address of claimee
  /// @param amount of tokens owed to claimee
  /// @param proof merkle proof to prove address and amount are in tree
  function claim(address to, uint256 amount, bytes32[] calldata proof) external {
    // Check if airdrop still active and address hasn't already claimed tokens
    require(!hasClaimed[to], "AirdropClaim: Already claimed");
    require(block.number <= deadline, "AirdropClaim: Claiming period expired");

    // Verify merkle proof, or revert if not in tree
    bytes32 leaf = keccak256(abi.encodePacked(to, amount));
    bool isValidLeaf = MerkleProof.verify(proof, merkleRoot, leaf);
    if (!isValidLeaf) revert("AirdropClaim: Invalid Address");

    // Send tokens to claimee
    hasClaimed[to] = true;
    airdropToken.safeTransfer(to, amount);
    emit Claimed(to, amount);
  }

  /// @notice Allows token deployer to deposit ERC20 token to be airdropped
  /// @dev Airdrop contract must be funded prior to claiming
  /// @param amount is the number of tokens to be deposited
  function depositERC20(uint256 amount) external {
    airdropToken.safeTransferFrom(msg.sender, address(this), amount);
  }

  /// @notice Allows owner to recover unclaimed ERC20 tokens deposited to contract 
  /// after airdrop deadline
  function recoverERC20() external {
    // Check that sender is contract owner and airdrop period has expired
    require(msg.sender == owner, "AirdropClaim: Only owner can recover tokens");
    require(block.number > deadline, "AirdropClaim: Airdrop still active");

    // Obtain current contract balance
    uint256 recoverBalance  = airdropToken.balanceOf(address(this));

    // Transfer remaining balance to owner
    airdropToken.safeTransfer(msg.sender, recoverBalance);
  }

  /// @notice Prevent accidental ETH deposits
  receive() external payable {
    revert();
  }
}