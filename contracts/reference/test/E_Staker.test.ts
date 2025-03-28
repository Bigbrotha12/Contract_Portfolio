import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import { expect } from 'chai';
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import hre from 'hardhat';
import { DemoToken } from '../typechain-types/contracts/A_DemoToken';
import { Staker } from '../typechain-types/contracts/E_Staker';
import { BigNumber } from "ethers";

describe('Staker', function () {
  async function DeployFixture() {
    const [admin, user1, user2, user3] = await hre.ethers.getSigners();
    const name: string = "DemoToken";
    const symbol: string = "DEMO";
    const limit: number = 1_000;
    const whitelist: Array<string> = [admin.address, user1.address];

    const token = await (await hre.ethers.getContractFactory("DemoToken")).deploy(name, symbol, whitelist);
    await token.deployed();
    const stake = await (await hre.ethers.getContractFactory("Staker")).deploy(token.address, token.address);
    await token.changeMinter(stake.address, true);

    const IToken = token as DemoToken;
    const IStake = stake as Staker;
    return { IToken, IStake, admin, user1, user2, user3 };
  };
  
  describe("Deployment", function () {
    it("Should create contract with correct parameters.", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      
      expect(await IStake.rewardsToken()).to.be.equal(IToken.address);
      expect(await IStake.stakingToken()).to.be.equal(IToken.address);
    });
  });

  describe('Balance Trackers', function () {
    it("Should display user stake token balance", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const stakeAmount: BigNumber = hre.ethers.utils.parseUnits("100", 18);

      await IToken.mintTo(user2.address, stakeAmount);
      // Stake tokens from user 2
      await expect(IStake.connect(user2).stake(stakeAmount)).to.emit(IStake, "Staked").withArgs(
        user2.address,
        stakeAmount
      );
      // Check balance
      expect(await IStake.balanceOf(user2.address)).to.be.equal(stakeAmount);
    });
    
    it("Should display correct total stake token supply", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const stakeAmount: BigNumber = hre.ethers.utils.parseUnits("100", 18);
      
      await IToken.mintTo(user1.address, stakeAmount);
      await IToken.mintTo(user2.address, stakeAmount);
     // Add a stake from user 1 and 2
      await IStake.connect(user1).stake(stakeAmount);
      await IStake.connect(user2).stake(stakeAmount);

      // Check balance
      expect(await IStake.totalSupply()).to.be.equal(stakeAmount.mul(2));
    });
  
    it("Should allow users to withdraw stake tokens from contract", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const stakeAmount: BigNumber = hre.ethers.utils.parseUnits("100", 18);

      // Mint and add stake
      await IToken.mintTo(user1.address, stakeAmount);
      await IStake.connect(user1).stake(stakeAmount);
      expect(await IStake.totalSupply()).to.be.equal(stakeAmount);
      expect(await IToken.balanceOf(user1.address)).to.be.equal(0);

      // Partial withdrawal should work
      await expect(IStake.connect(user1).withdraw(stakeAmount.mul(8).div(10))).to.emit(IStake, "Withdrawn").withArgs(
        user1.address,
        stakeAmount.mul(8).div(10)
      );
      // Full withdrawal should work
      await expect(IStake.connect(user1).withdraw(stakeAmount.mul(2).div(10))).to.emit(IStake, "Withdrawn").withArgs(
        user1.address,
        stakeAmount.mul(2).div(10)
      );
      expect(await IStake.totalSupply()).to.be.equal(0);
      expect(await IToken.balanceOf(user1.address)).to.be.equal(stakeAmount);

      // Over-withdraw should fail
      await expect(IStake.connect(user1).withdraw(stakeAmount)).to.be.revertedWith("Staker: Insufficient balance.");
    });  
  });

  describe("Staking mechanism", function () {  
    it("Should allow admin to start staking program", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const timeDuration = 100  // 100 seconds
      const totalReward: BigNumber = hre.ethers.utils.parseUnits("10000", 18)  // 10,000 DemoTokens

      // Non-admin program activations should fail
      await expect(IStake.connect(user1).setRewardsDuration(timeDuration)).to.be.reverted;
      await expect(IStake.connect(user1).setRewardAmount(totalReward)).to.be.reverted;
      await expect(IStake.setRewardsDuration(timeDuration)).to.emit(IStake, "DurationUpdated").withArgs(timeDuration);
      await expect(IStake.setRewardAmount(totalReward)).to.emit(IStake, "RewardUpdated").withArgs(totalReward);
    });

    it("Should not allow admin to start duplicate staking program", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const timeDuration = 100  // 100 seconds
      const totalReward: BigNumber = hre.ethers.utils.parseUnits("10000", 18)  // 10,000 DemoTokens

      await IStake.setRewardsDuration(timeDuration);
      await IStake.setRewardAmount(totalReward);
      await expect(IStake.setRewardsDuration(timeDuration)).to.be.revertedWith("Staker: Reward duration not finished.");
    });
  
    it("Should calculate and display the total rewards earned by user", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const stakeAmount: BigNumber = hre.ethers.utils.parseUnits("100", 18);
      const timeDuration = 100  // 100 seconds
      const totalReward: BigNumber = hre.ethers.utils.parseUnits("10000", 18)  // 10,000 DemoTokens

      // Mint and stake tokens for user 1
      await IToken.mintTo(user1.address, stakeAmount);
      await IStake.connect(user1).stake(stakeAmount);

      // Activate rewards program
      await IStake.setRewardsDuration(timeDuration);
      await IStake.setRewardAmount(totalReward);

      // Increase time well beyond program duration
      await time.increaseTo(await time.latest() + timeDuration * 2);

      // Check rewards after program completion
      expect(await IStake.balanceOf(user1.address)).to.be.equal(stakeAmount);
      expect(await IStake.earned(user1.address)).to.be.equal(totalReward);
      await IStake.connect(user1).withdraw(stakeAmount);
      await IStake.connect(user1).getReward();
      expect(await IToken.balanceOf(user1.address)).to.be.equal(stakeAmount.add(totalReward));
    });
  
    it("Should update users reward balance throughout incentive program", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const stakeAmount: BigNumber = hre.ethers.utils.parseUnits("100", 18);
      const timeDuration = 100  // 100 seconds
      const totalReward: BigNumber = hre.ethers.utils.parseUnits("10000", 18)  // 10,000 DemoTokens

      // Mint and stake tokens for user 1
      await IToken.mintTo(user1.address, stakeAmount);
      await IStake.connect(user1).stake(stakeAmount);

      // Activate rewards program
      await IStake.setRewardsDuration(timeDuration);
      await IStake.setRewardAmount(totalReward);

      // After 25% of time elapse, user 1 should have earned 25% of total reward
      await time.increase(timeDuration * 1 / 4);
      expect(await IStake.earned(user1.address)).to.be.equal(totalReward.mul(1).div(4));

      // After 50% of time elapse, user 1 should have earned 50% of total reward
      await time.increase(timeDuration * 1 / 4);
      expect(await IStake.earned(user1.address)).to.be.equal(totalReward.mul(2).div(4));

      // After 75% of time elapse, user 1 should have earned 75% of total reward
      await time.increase(timeDuration * 1 / 4)
      expect(await IStake.earned(user1.address)).to.be.equal(totalReward.mul(3).div(4));
    });

    it("Should allocate users reward according to their proportion of stake token pool", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const stakeAmount: BigNumber = hre.ethers.utils.parseUnits("100", 18);
      const timeDuration = 100  // 100 seconds
      const totalReward: BigNumber = hre.ethers.utils.parseUnits("10000", 18)  // 10,000 DemoTokens

      // Mint and stake tokens for user 1 and 2
      await IToken.mintTo(user1.address, stakeAmount);
      await IStake.connect(user1).stake(stakeAmount.mul(8).div(10));
      await IToken.mintTo(user2.address, stakeAmount);
      await IStake.connect(user2).stake(stakeAmount.mul(2).div(10));

      // Activate rewards program
      await IStake.setRewardsDuration(timeDuration);
      await IStake.setRewardAmount(totalReward);

      // User 1 holds 80% of staked supply and should receive 80% of total reward.
      // User 2 holds 20% of staked supply and should receive 20% of total reward.
      await time.increase(timeDuration);
      expect(await IStake.earned(user1.address)).to.be.equal(totalReward.mul(8).div(10));
      expect(await IStake.earned(user2.address)).to.be.equal(totalReward.mul(2).div(10));
    });
  
    it("should allow user to stake additional stake tokens and allocate reward accordingly", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const stakeAmount: BigNumber = hre.ethers.utils.parseUnits("100", 18);
      const timeDuration = 100  // 100 seconds
      const totalReward: BigNumber = hre.ethers.utils.parseUnits("10000", 18)  // 10,000 DemoTokens

      // Mint and stake tokens for user 1 and 2
      await IToken.mintTo(user1.address, stakeAmount);
      await IStake.connect(user1).stake(stakeAmount);
      await IToken.mintTo(user2.address, stakeAmount);
      

      // Activate rewards program
      await IStake.setRewardsDuration(timeDuration);
      await IStake.setRewardAmount(totalReward);

      // User 1 holds 100% of staked supply and should receive 50% of total reward halfway through program.
      await time.increase(timeDuration / 2 - 1);
      await IStake.connect(user2).stake(stakeAmount);

      // User 2 stakes and holds 50% of staked supply. User 1 staked supply drops to 50%.
      // User 2 should receive 50% of remaining reward of 25% of total reward while user 1
      // should receive 75% of total reward.
      await time.increase(timeDuration / 2);
      expect(await IStake.earned(user1.address)).to.be.equal(totalReward.mul(75).div(100));
      expect(await IStake.earned(user2.address)).to.be.equal(totalReward.mul(25).div(100));
    });
  });
});