// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./../A_DemoToken/DemoToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staker is Ownable {

    //------------------ STATE VARIABLES ---------------------------------------

    DemoToken public immutable stakingToken;
    DemoToken public immutable rewardsToken;   
    uint public duration;   // Duration of rewards to be paid out (in seconds)   
    uint public finishAt;   // Timestamp of when the rewards finish   
    uint public updatedAt;  // Minimum of last updated time and reward finish time  
    uint public rewardRate; // Reward to be paid out per second  
    uint public rewardPerTokenStored;   // Sum of (reward rate * dt * 1e18 / total supply)   
    mapping(address => uint256) public userRewardPerTokenPaid; // User address => rewardPerTokenStored
    mapping(address => uint256) public rewards;    // User address => rewards to be claimed
    uint256 public totalSupply;    // Total staked
    mapping(address => uint256) public balanceOf;  // User address => staked amount

//----------------------- EVENTS -------------------------------------------

    event Staked(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event DurationUpdated(uint256 newDuration);
    event RewardUpdated(uint256 newReward);

//--------------------  CONSTRUCTOR ----------------------------------------
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

    function lastTimeRewardApplicable() public view returns (uint256) {
        return _min(finishAt, block.timestamp);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }

        return
            rewardPerTokenStored +
            (rewardRate * (lastTimeRewardApplicable() - updatedAt) * 1e18) /
            totalSupply;
    }

    function earned(address _account) public view returns (uint256) {
        return
            ((balanceOf[_account] *
                (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) +
            rewards[_account];
    }

//-------------------- MUTATIVE FUNCTIONS ----------------------------------

    function stake(uint256 _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        stakingToken.burnFrom(msg.sender, _amount);
        balanceOf[msg.sender] += _amount;
        totalSupply += _amount;

        emit Staked(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external updateReward(msg.sender) {
        require(_amount <= balanceOf[msg.sender], "Staker: Insufficient balance.");
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        stakingToken.mintTo(msg.sender, _amount);

        emit Withdrawn(msg.sender, _amount);
    }

    function getReward() external updateReward(msg.sender) {
        uint reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.mintTo(msg.sender, reward);
        }
    }

    function setRewardsDuration(uint256 _duration) external onlyOwner {
        require(finishAt < block.timestamp, "Staker: Reward duration not finished.");
        duration = _duration;

        emit DurationUpdated(_duration);
    }

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
