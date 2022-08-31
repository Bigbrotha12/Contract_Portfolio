// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Staking
/// @notice Provides basic DeFi staking capabilities
/// @dev Staking contract calculates rewards on a per-block basis. Contract
/// @dev does not support fee-on-transfer and rebase tokens and can be paused by
/// @dev admin in case of emergency. Active reward must be less than 2^256 / 1e18
/// @dev to prevent overflow.
contract Staking is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

//------------------ STATE VARIABLES ---------------------------------------

    IERC20 public rewardsToken;             // Token to be used as reward
    IERC20 public stakeToken;               // Token to be incentivized
    uint256 public endBlock;                // Block number for program end
    uint256 public blockReward;             // Rate of reward per block
    uint256 public rewardsDuration;         // Number of blocks for incentive
    uint256 public lastBlock;               // Last block when called
    uint256 public accBlockReward;          // Accumulated reward per token
    uint256 public totalSupply;             // Total number of staked tokens
    mapping(address => uint256) private userAccBlockReward;
    mapping(address => uint256) private rewards;
    mapping(address => uint256) private balances;

//----------------------- EVENTS -------------------------------------------

    event RewardIncreased(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event DurationUpdated(uint256 newDuration);

//--------------------  CONSTRUCTOR ----------------------------------------

    /// @notice Sets the token to be used for staking and token to be given out
    /// @notice as rewards
    /// @param _rewardsToken       Claimable token address.
    /// @param _stakingToken       Stakeable token address.
    constructor(address _rewardsToken, address _stakingToken) {
        rewardsToken = IERC20(_rewardsToken);
        stakeToken = IERC20(_stakingToken);
    }

//------------------------ VIEWS -------------------------------------------

    /// @notice Returns total number of staked tokens
    function totalStakedSupply() external view returns (uint256) {
        return totalSupply;
    }

    /// @notice Returns user staked token balance
    /// @param _account        Address of user to check staked token balance.
    function balanceOf(address _account) external view returns (uint256) {
        return balances[_account];
    }

    /// @notice Returns staking rewards earned: current reward + earned but
    /// @notice not withdrawn reward
    /// @param _account        Address of user to check reward earned.
    function earned(address _account) public view returns (uint256) {
      uint256 accReward = accBlockReward;
      uint256 currentBlock = block.number < endBlock ? block.number : endBlock;
      if (totalSupply != 0) {
          accReward += ((currentBlock - lastBlock) * blockReward * 1e18 / totalSupply);
      }
        return balances[_account] * (accReward - userAccBlockReward[_account]) / 1e18 + rewards[_account];
    }

//-------------------- MUTATIVE FUNCTIONS ----------------------------------

    /// @notice Allows user to deposit incentivized tokens to earn reward.
    /// @notice Function is non-reentrant and can be paused by admin.
    /// @dev Function does not check that '_amount' deposited is actually
    /// @dev received by contract (due to fee-on-transfer, or error), hence contract deployer
    /// @dev must ensure stake token does not implement such features.
    /// @param _amount          Number of stake tokens to be deposited
    function stake(uint256 _amount) external nonReentrant whenNotPaused {
        require(stakeToken.balanceOf(msg.sender) >= _amount, "Staking: Insufficient balance");

        calculateReward(msg.sender);
        totalSupply += _amount;
        balances[msg.sender] += _amount;
        stakeToken.safeTransferFrom(msg.sender, address(this), _amount);

        emit Staked(msg.sender, _amount);
    }

    /// @notice Allows user to withdraw incentivized tokens + reward.
    /// @notice Function is non-reentrant and cannot be paused by admin.
    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Staking: Insufficient balance");

        calculateReward(msg.sender);
        totalSupply -= amount;
        balances[msg.sender] -= amount;

        stakeToken.safeTransfer(msg.sender, amount);
        uint256 reward = rewards[msg.sender];
        if (reward != 0) {
            rewards[msg.sender] = 0;
            rewardsToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }

        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Allows user to withdraw their deposited tokens in case of failure.
    /// @dev Fail-safe to ensure users are able to withdraw stake tokens.
    /// @param _amount          Number of stake tokens to be withdrawn.
    function safeWithdraw(uint256 _amount) external nonReentrant {
        require(balances[msg.sender] >= _amount, "Staking: Insufficient balance");

        calculateReward(msg.sender);
        totalSupply -= _amount;
        balances[msg.sender] -= _amount;
        stakeToken.safeTransfer(msg.sender, _amount);

        emit Withdrawn(msg.sender, _amount);
    }

    /// @dev Returnsrewards earned by users since contract was last called.
    /// @param _account         Address of user to calculate earned rewards
    function calculateReward(address _account) private {
        uint256 currentBlock = block.number < endBlock ? block.number : endBlock;
        if (totalSupply != 0) {
            accBlockReward += ((currentBlock - lastBlock) * blockReward * 1e18 / totalSupply);
        }
        lastBlock = currentBlock;

        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userAccBlockReward[_account] = accBlockReward;
        }
    }

//------------------- RESTRICTED FUNCTIONS ---------------------------------

    /// @notice Allows admin to provide funding for staking contract
    /// @dev Only serves as convenience function since there's nothing preventing
    /// @dev admin or other users from depositing tokens directly to contract address.
    /// @param _funds           Amount of reward tokens to be deposited.
    function addFunding(uint256 _funds) external onlyOwner {
      rewardsToken.safeTransferFrom(msg.sender, address(this), _funds);
    }

    /// @notice Allows admin to activate reward distribution for a specified
    /// @notice period of time.
    /// @dev Only one incentive program can be active at any given time.
    /// @param _reward          Amount of reward tokens to be distributed.
    /// @param _duration        Number of blocks program will be active.
    function activateReward(uint256 _reward, uint256 _duration) external onlyOwner {
      require(
          block.number >= endBlock,
          "Staking: Current rewards program must be complete before activating new rewards program"
      );

      rewardsDuration = _duration;
      calculateReward(address(0));
      blockReward = _reward / _duration;
      uint256 balance = rewardsToken.balanceOf(address(this));
      require(blockReward <= balance / _duration, "Staking: Insufficient reward balance");
      lastBlock = block.number;
      endBlock = block.number + _duration;

      emit DurationUpdated(_duration);
      emit RewardIncreased(_reward);
    }

    /// @notice Allows admin pause "stake" function and prevent any future staking.
    /// @notice Withdraw function cannot be paused.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Allows admin unpause "stake" function and allow any future staking.
    function unpause() external onlyOwner {
        _unpause();
    }
}
