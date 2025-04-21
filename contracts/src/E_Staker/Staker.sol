// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {DemoToken} from "./../A_ERC20/DemoToken.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title Staker
/// @author Rafael Mendoza
/// @notice Staking reward contract.
/// @dev Implementation based on SNX Staking contract modified for use for demonstration.
contract Staker is Ownable {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    DemoToken public s_stakingToken;
    DemoToken public s_rewardsToken;
    uint public s_duration;
    uint public s_finishAt;
    uint public s_updatedAt;
    uint public s_rewardRate;
    uint public s_rewardPerTokenStored;
    mapping(address user => uint256 rewardPerToken) public s_userRewardPerTokenPaid;
    mapping(address user => uint256 reward) public s_rewards;
    uint256 public s_totalSupply;
    mapping(address user => uint256 amount) public s_balanceOf;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    event Staked(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event DurationUpdated(uint256 newDuration);
    event RewardUpdated(uint256 newReward);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 ERRORS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    error Staker__ZeroValue();
    error Staker__InsufficientFunds(uint256 amount, uint256 required);
    error Staker__StillActive(uint256 current, uint256 deadline);
    error Staker__ZeroRewardRate();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                MODIFIERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    modifier updateReward(address _account) {
        s_rewardPerTokenStored = rewardPerToken();
        s_updatedAt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            s_rewards[_account] = earned(_account);
            s_userRewardPerTokenPaid[_account] = s_rewardPerTokenStored;
        }

        _;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /// @notice Create new staking contract with a given stake token and reward token. For the purpose of demonstration,
    /// @notice both tokens must implement DemoToken.
    /// @param _stakingToken address of staking token contract.
    /// @param _rewardToken address of reward token contract.
    /// @param _admin address of administrator.
    constructor(DemoToken _stakingToken, DemoToken _rewardToken, address _admin) Ownable(_admin) {
        s_stakingToken = _stakingToken;
        s_rewardsToken = _rewardToken;
    }

    /// @notice Sets the amount of time the staking rewards will be distributed to stakers. This function does not
    /// @notice initiate the program and must be called prior to starting new program.
    /// @dev Program parameters may not be changed after starting new program.
    /// @param _duration in seconds for rewards distribution.
    function setRewardsDuration(uint256 _duration) external onlyOwner {
        if(s_finishAt > block.timestamp) revert Staker__StillActive(block.timestamp, s_finishAt);
        s_duration = _duration;

        emit DurationUpdated(_duration);
    }

    /// @notice Sets the amount of reward tokens to be distributed over the life of the staking rogram and may only
    /// @notice be set after setting program duration and there are no active staking program.
    /// @dev Program parameters may not be changed after starting new program. 
    /// @param _amount of reward tokens to be distributed over the life of the staking program.
    function setRewardAmount(uint256 _amount) external onlyOwner updateReward(address(0)) {
        if (block.timestamp >= s_finishAt) {
            s_rewardRate = _amount / s_duration;
        } else {
            uint256 remainingRewards = (s_finishAt - block.timestamp) * s_rewardRate;
            s_rewardRate = (_amount + remainingRewards) / s_duration;
        }
        if(s_rewardRate == 0) revert Staker__ZeroRewardRate();

        s_finishAt = block.timestamp + s_duration;
        s_updatedAt = block.timestamp;

        emit RewardUpdated(_amount);
    }

    /// @notice Allows contract owner to change Demo Token to be used for test.
    /// @param _token address of new token conforming to the DemoToken interface.
    function setToken(DemoToken _token) external onlyOwner {
        s_rewardsToken = _token;
        s_stakingToken = _token;
    }

    /// @notice Deposits DemoToken to contract to start earning toke rewards.
    /// @dev Rewards are only earned while staking program is open. Contract
    /// @dev will trigger update of reward balances and yield.
    /// @param _amount number of tokens to be deposited.
    function stake(uint256 _amount) external updateReward(msg.sender) {
        if(_amount == 0) revert Staker__ZeroValue();

        s_stakingToken.burnFrom(msg.sender, _amount);
        s_balanceOf[msg.sender] += _amount;
        s_totalSupply += _amount;

        emit Staked(msg.sender, _amount);
    }

    /// @notice Withdraws DemoToken from the contract. Token rewards earned must be claimed separately.
    /// @dev Rewards are only earned while staking program is open.
    /// @param _amount number of DemoToken to be withdrawn.
    function withdraw(uint256 _amount) external updateReward(msg.sender) {
        if(_amount > s_balanceOf[msg.sender]) revert Staker__InsufficientFunds(s_balanceOf[msg.sender], _amount);
        
        s_balanceOf[msg.sender] -= _amount;
        s_totalSupply -= _amount;
        s_stakingToken.mintTo(msg.sender, _amount);

        emit Withdrawn(msg.sender, _amount);
    }

    /// @notice Claims any earned rewards through staking without withdrawing stake.
    /// @dev Rewards are only earned while staking program is open. Contract
    /// @dev will trigger update of reward balances and yield.
    function getReward() external updateReward(msg.sender) {
        uint256 reward = s_rewards[msg.sender];
        
        if (reward > 0) {
            s_rewards[msg.sender] = 0;
            s_rewardsToken.mintTo(msg.sender, reward);
        }
    }

    /// @notice Returns the current timestamp bounded by staking program expiration.
    function lastTimeRewardApplicable() public view returns (uint256) {
        return _min(s_finishAt, block.timestamp);
    }

    /// @notice Returns current yield per token staked.
    function rewardPerToken() public view returns (uint256) {
        if (s_totalSupply == 0) {
            return s_rewardPerTokenStored;
        }

        return
            s_rewardPerTokenStored + 
            (s_rewardRate * (lastTimeRewardApplicable() - s_updatedAt) * 1e18) / 
            s_totalSupply;
    }

    /// @notice Returns rewards earned but unclaimed by a given address.
    /// @param _account address of user being queried.
    function earned(address _account) public view returns (uint256) {
        return
            ((s_balanceOf[_account] * (rewardPerToken() - s_userRewardPerTokenPaid[_account])) / 1e18) +
            s_rewards[_account];
    }

    function _min(uint256 x, uint256 y) private pure returns (uint256) {
        return x <= y ? x : y;
    }
}
