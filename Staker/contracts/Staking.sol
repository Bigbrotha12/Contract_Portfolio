// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

    /// @title A staking contract
    /// @notice Provides basic staking capabilities
    /// @dev Staking contract calculates rewards on a per-block basis. Contract
    /// does not support fee-on-transfer and rebase tokens and can be paused by
    /// admin in case of emergency. Active reward must be less than 2^256 / 1e18
    /// to prevent overflow.
contract Staking is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    //------------------ STATE VARIABLES ---------------------------------------

    IERC20 public _rewardsToken;             // Token to be used as reward
    IERC20 public _stakeToken;               // Token to be incentivized
    uint256 public _endBlock;                // Block number for program end
    uint256 public _blockReward;             // Rate of reward per block
    uint256 public _rewardsDuration;         // Number of blocks for incentive
    uint256 public _lastBlock;               // Last block when called
    uint256 public _accBlockReward;          // Accumulated reward per token
    uint256 public _totalSupply;             // Total number of staked tokens
    mapping(address => uint256) private _userAccBlockReward;
    mapping(address => uint256) private _rewards;
    mapping(address => uint256) private _balances;

    //----------------------- EVENTS -------------------------------------------

    event RewardIncreased(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event DurationUpdated(uint256 newDuration);

    //--------------------  CONSTRUCTOR ----------------------------------------

    constructor(address rewardsToken, address stakingToken) {
        _rewardsToken = IERC20(rewardsToken);
        _stakeToken = IERC20(stakingToken);
    }

    //------------------------ VIEWS -------------------------------------------

    /// @notice Returns total number of staked tokens
    /// @return uint256       Number of stake tokens deposited by all users.
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    /// @notice Returns user staked token balance
    /// @param account        Address of user to check staked token balance.
    /// @return uint256       Number of stake tokens deposited by user.
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /// @notice Returns staking rewards earned: current reward + earned but
    /// not withdrawn reward
    /// @param account        Address of user to check reward earned.
    /// @return uint256       Number of reward tokens earned but not withdrawn.
    function earned(address account) public view returns (uint256) {
      uint256 accReward = _accBlockReward;
      uint256 currentBlock = block.number < _endBlock ? block.number : _endBlock;
      if (_totalSupply != 0) {
          accReward += ((currentBlock - _lastBlock) * _blockReward * 1e18 / _totalSupply);
      }
        return _balances[account] * (accReward - _userAccBlockReward[account]) / 1e18 + _rewards[account];
    }

    //-------------------- MUTATIVE FUNCTIONS ----------------------------------

    /// @notice Allows user to deposit incentivized tokens to earn reward.
    /// Function is non-reentrant and can be paused by admin.
    /// @dev Function does not check that 'amount' deposited is actually
    /// received by contract (due to fee-on-transfer, or error), hence contract deployer
    /// must ensure stake token does not implement such features.
    /// @param amount       Number of stake tokens to be deposited
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(_stakeToken.balanceOf(msg.sender) >= amount, "Insufficient balance");

        calculateReward(msg.sender);
        _totalSupply += amount;
        _balances[msg.sender] += amount;
        _stakeToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    /// @notice Allows user to withdraw incentivized tokens + reward.
    /// Function is non-reentrant and cannot be paused by admin.
    /// @param amount       Number of stake tokens to be withdrawn.
    function withdraw(uint256 amount) external nonReentrant {
        require(_balances[msg.sender] >= amount, "Insufficient balance");

        calculateReward(msg.sender);
        _totalSupply -= amount;
        _balances[msg.sender] -= amount;
        _stakeToken.safeTransfer(msg.sender, amount);
        uint256 reward = _rewards[msg.sender];
        if (reward != 0) {
            _rewards[msg.sender] = 0;
            _rewardsToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }

        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Allows user to withdraw their deposited tokens in case of reward
    /// token failure.
    /// @dev Fail-safe to ensure users are able to withdraw stake tokens.
    /// @param amount       Number of stake tokens to be withdrawn.
    function safeWithdraw(uint256 amount) external nonReentrant {
        require(_balances[msg.sender] >= amount, "Insufficient balance");

        calculateReward(msg.sender);
        _totalSupply -= amount;
        _balances[msg.sender] -= amount;
        _stakeToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    /// @dev Calculates the block rewards earned by users since contract was
    /// last called.
    /// @param account        Address of user to calculate earned rewards
    function calculateReward(address account) private {
        uint256 currentBlock = block.number < _endBlock ? block.number : _endBlock;
        if (_totalSupply != 0) {
            _accBlockReward += ((currentBlock - _lastBlock) * _blockReward * 1e18 / _totalSupply);
        }
        _lastBlock = currentBlock;

        if (account != address(0)) {
            _rewards[account] = earned(account);
            _userAccBlockReward[account] = _accBlockReward;
        }
    }

    //------------------- RESTRICTED FUNCTIONS ---------------------------------

    /// @notice Allows admin to provide funding for staking contract
    /// @dev Only serves as convenience function since there's nothing preventing
    /// admin or other users from depositing tokens directly to contract address.
    /// @param funds        Amount of reward tokens to be deposited.
    function addFunding(uint256 funds) external onlyOwner {
      _rewardsToken.safeTransferFrom(msg.sender, address(this), funds);
    }

    /// @notice Allows admin to activate reward distribution for a specified
    /// period of time.
    /// @dev Only one incentive program can be active at any given time.
    /// @param reward        Amount of reward tokens to be distributed.
    /// @param duration      Number of blocks program will be active.
    function activateReward(uint256 reward, uint256 duration) external onlyOwner {
      require(
          block.number >= _endBlock,
          "Current rewards program must be complete before activating new rewards program"
      );

      _rewardsDuration = duration;
      calculateReward(address(0));
      _blockReward = reward / duration;
      uint256 balance = _rewardsToken.balanceOf(address(this));
      require(_blockReward <= balance / duration, "Insufficient reward balance");
      _lastBlock = block.number;
      _endBlock = block.number + duration;

      emit DurationUpdated(duration);
      emit RewardIncreased(reward);
    }

    /// @notice Allows admin pause "stake" function and prevent any future staking.
    /// Withdraw function cannot be paused.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Allows admin unpause "stake" function and allow any future staking.
    function unpause() external onlyOwner {
        _unpause();
    }
}
