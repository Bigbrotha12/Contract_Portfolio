// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title AirdropClaim
/// @notice Allows user to claim ERC20 token if part of Merkle Tree within
/// owner-specified deadline.
contract AirdropDemo {
    using SafeERC20 for IERC20;

    //------------------ STATE VARIABLES ---------------------------------------

    mapping(address => bytes32) public merkleRoot; // Root of tree containing valid address
    address public owner; // Contract administrator
    IERC20 public demoToken;
    mapping(address => bool) public hasClaimed; // Records if user has already claimed

    //----------------------- EVENTS -------------------------------------------

    event Claimed(address indexed to, uint256 amount);

    //--------------------  CONSTRUCTOR ----------------------------------------

    /// @notice Creates a new AirdropClaim contract
    constructor() {
        owner = msg.sender;
    }

    //-------------------- MUTATIVE FUNCTIONS ----------------------------------

    function createAirdrop(bytes32 _root) external {
        merkleRoot[msg.sender] = _root;
    }

    function setToken(IERC20 _token) external {
        require(msg.sender == owner, "AirdropDemo: Unauthorized");

        demoToken = _token;
    }

    /// @notice Allows user to claim token if address is part of merkle tree
    /// @dev A valid claim should revert if contract has insufficient funds
    /// @param _to address of claimee
    /// @param _amount of tokens owed to claimee
    /// @param _proof merkle proof to prove address and amount are in tree
    function claim(
        address _creator,
        address _to,
        uint256 _amount,
        bytes32[] calldata _proof
    ) external {
        // Check if airdrop still active and address hasn't already claimed tokens
        require(!hasClaimed[_to], "AirdropClaim: Already claimed");

        // Verify merkle proof, or revert if not in tree
        bytes32 leaf = keccak256(abi.encodePacked(_to, _amount));
        bool isValidLeaf = MerkleProof.verify(
            _proof,
            merkleRoot[_creator],
            leaf
        );
        if (!isValidLeaf) revert("AirdropClaim: Invalid Address");

        // Send tokens to claimee
        hasClaimed[_to] = true;
        demoToken.safeTransfer(_to, _amount);
        emit Claimed(_to, _amount);
    }

    /// @notice Prevent accidental ETH deposits
    receive() external payable {
        revert();
    }
}
