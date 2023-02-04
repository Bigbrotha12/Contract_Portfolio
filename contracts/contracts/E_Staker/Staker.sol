// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./../A_DemoToken/DemoToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Staker
/// @notice Staking reward contract.
/// @dev Implementation based on SNX Staking contract modified
/// @dev for use for demonstration.
contract Staker is Ownable {

    //------------------ STATE VARIABLES ---------------------------------------

    DemoToken public stakingToken;
    DemoToken public rewardsToken;   
    uint public duration;                                       // Duration of rewards to be paid out (in seconds)   
    uint public finishAt;                                       // Timestamp of when the rewards finish   
    uint public updatedAt;                                      // Minimum of last updated time and reward finish time  
    uint public rewardRate;                                     // Reward to be paid out per second  
    uint public rewardPerTokenStored;                           // Sum of (reward rate * dt * 1e18 / total supply)   
    mapping(address => uint256) public userRewardPerTokenPaid;  // User address => rewardPerTokenStored
    mapping(address => uint256) public rewards;                 // User address => rewards to be claimed
    uint256 public totalSupply;                                 // Total staked
    mapping(address => uint256) public balanceOf;               // User address => staked amount

//----------------------- EVENTS -------------------------------------------

    event Staked(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event DurationUpdated(uint256 newDuration);
    event RewardUpdated(uint256 newReward);

//--------------------  CONSTRUCTOR ----------------------------------------

    /// @notice Create new staking contract with a given stake token and reward
    /// @notice token. For the purpose of demonstration, both tokens must implement DemoToken.
    /// @param _stakingToken address of staking token contract.
    /// @param _rewardToken address of reward token contract.
    constructor(DemoToken _stakingToken, DemoToken _rewardToken) {
        stakingToken = _stakingToken;
        rewardsToken = _rewardToken;
    }

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }

        _;
    }

//------------------------ VIEWS -------------------------------------------

    /// @notice Returns the current timestamp bounded by staking program expiration.
    function lastTimeRewardApplicable() public view returns (uint256) {
        return _min(finishAt, block.timestamp);
    }

    /// @notice Returns current yield per token staked.
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }

        return
            rewardPerTokenStored +
            (rewardRate * (lastTimeRewardApplicable() - updatedAt) * 1e18) /
            totalSupply;
    }

    /// @notice Returns rewards earned but unclaimed by a given address.
    /// @param _account address of user being queried.
    function earned(address _account) public view returns (uint256) {
        return
            ((balanceOf[_account] *
                (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) +
            rewards[_account];
    }

//-------------------- MUTATIVE FUNCTIONS ----------------------------------

    /// @notice Allows contract owner to change Demo Token to be used for test.
    /// @param _token address of new token conforming to the DemoToken interface.
    function setToken(DemoToken _token) external {
        require(msg.sender == owner(), "IBC_Bridge: Unauthorized.");
        rewardsToken = _token;
        stakingToken = _token;
    }

    /// @notice Deposits DemoToken to contract to start earning toke rewards.
    /// @dev Rewards are only earned while staking program is open. Contract
    /// @dev will trigger update of reward balances and yield.
    /// @param _amount number of tokens to be deposited.
    function stake(uint256 _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        stakingToken.burnFrom(msg.sender, _amount);
        balanceOf[msg.sender] += _amount;
        totalSupply += _amount;

        emit Staked(msg.sender, _amount);
    }

    /// @notice Withdraws DemoToken from the contract. Token rewards earned must be claimed
    /// @notice separately.
    /// @dev Rewards are only earned while staking program is open. Contract
    /// @dev will trigger update of reward balances and yield.
    /// @param _amount of DemoToken to be withdrawn.
    function withdraw(uint256 _amount) external updateReward(msg.sender) {
        require(_amount <= balanceOf[msg.sender], "Staker: Insufficient balance.");
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        stakingToken.mintTo(msg.sender, _amount);

        emit Withdrawn(msg.sender, _amount);
    }

    /// @notice Claims any earned rewards through staking without withdrawing stake.
    /// @dev Rewards are only earned while staking program is open. Contract
    /// @dev will trigger update of reward balances and yield.
    function getReward() external updateReward(msg.sender) {
        uint reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.mintTo(msg.sender, reward);
        }
    }

    /// @notice Sets the amount of time the staking rewards will be distributed to stakers.
    /// @notice This function does not initiate the program and must be called prior to starting
    /// @notice new program.
    /// @dev Program parameters may not be changed after starting new program.
    /// @param _duration in seconds for rewards distribution.
    function setRewardsDuration(uint256 _duration) external onlyOwner {
        require(finishAt < block.timestamp, "Staker: Reward duration not finished.");
        duration = _duration;

        emit DurationUpdated(_duration);
    }

    /// @notice Sets the amount of reward tokens to be distributed over the life of the staking
    /// @notice program and may only be set after setting program duration and there are no 
    /// @notice active staking program.
    /// @dev Program parameters may not be changed after starting new program. 
    /// @param _amount of reward tokens to be distributed over the life of the staking program.
    function setRewardAmount(
        uint256 _amount
    ) external onlyOwner updateReward(address(0)) {
        if (block.timestamp >= finishAt) {
            rewardRate = _amount / duration;
        } else {
            uint256 remainingRewards = (finishAt - block.timestamp) * rewardRate;
            rewardRate = (_amount + remainingRewards) / duration;
        }

        require(rewardRate > 0, "reward rate = 0");

        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;

        emit RewardUpdated(_amount);
    }

    function _min(uint256 x, uint256 y) private pure returns (uint256) {
        return x <= y ? x : y;
    }
}
