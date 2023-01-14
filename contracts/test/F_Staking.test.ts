import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre from 'hardhat';
import { DemoToken } from '../typechain-types/contracts/A_DemoToken';
import { Staking } from '../typechain-types/contracts/F_Staker';

describe('Staker', function () {
  async function DeployFixture() {
    const [admin, user1, user2, user3] = await hre.ethers.getSigners();
    const name: string = "DemoToken";
    const symbol: string = "DEMO";
    const limit: number = 1000;
    const whitelist: Array<string> = [admin.address, user1.address];

    const token = await (await hre.ethers.getContractFactory("DemoToken")).deploy(name, symbol, whitelist, limit);
    const stake = await (await hre.ethers.getContractFactory("Staking")).deploy(token.address);
    await token.changeMinter(stake.address, true);

    const IToken = token as DemoToken;
    const IStake = stake as Staking;
    return { IToken, IStake, admin, user1, user2, user3 };
  };
  
  describe("Deployment", function () {
    it("should create contract with staking token address", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      
      // let sAddress = await staker.stakeToken();
      // assert.equal(sAddress, sToken.address, "Staking token not set up correctly");
    });
  
    it("should create contract with reward token address", async () => {
      const { IToken, IStake, admin, user1, user2, user3  } = await loadFixture(DeployFixture);
      // let rAddress = await staker.rewardsToken();
      // assert.equal(rAddress, rToken.address, "Reward token not set up correctly");
    });
  });

  describe('Balance Trackers', function () {
    it("should display correct total stake token supply", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      
      // //Approve deposit of stake tokens to the contract
      // await sToken.approve(staker.address, etherize('100'));
      // // Deposit stake tokens. NOTE: Only supported way to deposit stake tokens
      // // is through stake(uint256) function. Direct token deposits will be lost.
      // await staker.stake(etherize('100'));
  
      // let supply = await staker.totalStakedSupply();
      // let actualSupply = await sToken.balanceOf(staker.address);
  
      // assert.equal(supply.toString(), actualSupply.toString(), "Total supply not tracked correctly");
    });
  
    it("should display user stake token balance", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // await sToken.approve(staker.address, etherize('100'));
      // await staker.stake(etherize('100'));
      // // This step we give account 1 50 tokens and deposit them in contract.
      // // Expected balances: Account 0 == 100; Account 1 == 50; Total Supply == 150
      // await sToken.transfer(accounts[1], etherize('50'));
      // await sToken.approve(staker.address, etherize('50'), {from: accounts[1]});
      // await staker.stake(etherize('50'), {from: accounts[1]});
  
      // let balanceAct0 = await staker.balanceOf(accounts[0]);
      // let balanceAct1 = await staker.balanceOf(accounts[1]);
      // let supply = await staker.totalStakedSupply();
  
      // assert.equal(balanceAct0.toString(), etherize("100").toString(), "Account 0 balance is incorrect");
      // assert.equal(balanceAct1.toString(), etherize("50").toString(), "Account 1 balance is incorrect");
      // assert.equal(supply.toString(), etherize("150").toString(), "Total supply is incorrect");
    });
  
    it("should calculate and display the total rewards earned by user", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // await rToken.approve(staker.address, etherize('100'));
      // await staker.addFunding(etherize('100'));
  
      // // Deposit 50 stake tokens from account 0 and 50 tokens from account 1.
      // await sToken.transfer(accounts[1], etherize('100'));
      // await sToken.approve(staker.address, etherize('50'));
      // await sToken.approve(staker.address, etherize('50'), {from: accounts[1]});
      // await staker.stake(etherize('50'));
      // await staker.stake(etherize('50'), {from: accounts[1]});
  
      // // Activate reward program for 10 seconds and 100 reward tokens.
      // await staker.activateReward(etherize('100'), 10);
  
      // // Account 0 holds 50 / 100 = 50% of the supply.
      // // Account 1 holds 50 / 100 = 50% of the supply.
      // // After 5 seconds, account 0 should have 50 * 50% = 25 and account 1 should have 25
      // // After 10 seconds, account 0 should have 50 and account 1 should have 50
      // await mineBlock(5);
      // let account_0_reward = await staker.earned(accounts[0]);
      // account_0_reward = account_0_reward;
      // let account_1_reward = await staker.earned(accounts[1]);
      // account_1_reward = account_1_reward;
      // assert.equal(account_0_reward.toString(), etherize("25").toString(), "Account 0 reward incorrectly calculated at 5 seconds");
      // assert.equal(account_1_reward.toString(), etherize("25").toString(), "Account 1 reward incorrectly calculated at 5 seconds");
  
      // await mineBlock(5);
      // let account_0_reward2 = await staker.earned(accounts[0]);
      // account_0_reward2 = account_0_reward2;
      // let account_1_reward2 = await staker.earned(accounts[1]);
      // account_1_reward2 = account_1_reward2;
      // assert.equal(account_0_reward2.toString(), etherize("50").toString(), "Account 0 reward incorrectly calculated at 10 seconds");
      // assert.equal(account_1_reward2.toString(), etherize("50").toString(), "Account 1 reward incorrectly calculated at 10 seconds");
  
    });
  });

  describe("Staking", function () {  
    it("should allow users to deposit stake tokens for incentive program", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // await sToken.approve(staker.address, etherize("100"));
      // await staker.stake(etherize("10"));
  
      // let balance = await staker.balanceOf(accounts[0]);
      // let actualBalance = await sToken.balanceOf(staker.address);
      // let supply = await staker.totalStakedSupply();
      // assert.equal(balance.toString(), etherize("10"), "User balance not correctly maintained");
      // assert.equal(supply.toString(), etherize("10"), "Contract supply not correctly maintained");
      // assert.equal(supply.toString(), actualBalance.toString(), "Contract supply not correctly maintained");
  
      // await staker.stake(etherize("90"));
      // balance = await staker.balanceOf(accounts[0]);
      // actualBalance = await sToken.balanceOf(staker.address);
      // supply = await staker.totalStakedSupply();
      // assert.equal(balance.toString(), etherize("100").toString(), "User balance not correctly maintained");
      // assert.equal(supply.toString(), etherize("100").toString(), "Contract supply not correctly maintained");
      // assert.equal(supply.toString(), actualBalance.toString(), "Contract supply not correctly maintained");
  
    });
  
    it("should allow users to withdraw reward and stake tokens from incentive program", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // // Activate rewards program for 100 tokens and 20 seconds
      // await rToken.approve(staker.address, etherize("100"));
      // await staker.addFunding(etherize("100"));
      
      // // Deposit 100 stake tokens
      // await sToken.approve(staker.address, etherize("100"));
      // await staker.stake(etherize("100"));
  
      // // Wait for half program duration so rewards earned should be 100 / 2 = 50
      // await staker.activateReward(etherize("100"), 20);
      // await mineBlock(9);     // Withdraw will advance block by 1
  
      // let rInitBalance = await rToken.balanceOf(accounts[0]);
      // let sInitBalance = await sToken.balanceOf(accounts[0]);
      // await staker.withdraw();
      // let rEndBalance = await rToken.balanceOf(accounts[0]);
      // let sEndBalance = await sToken.balanceOf(accounts[0]);
      // let rDelta = rEndBalance.toString() - rInitBalance.toString();
      // let sDelta = sEndBalance.toString() - sInitBalance.toString();
      // assert.equal(rDelta.toString(), etherize("50").toString(), "Reward tokens not withdrawn correctly");
      // assert.equal(sDelta.toString(), etherize("100").toString(), "Stake tokens not withdrawn correctly");
  
      // // Contract state check
      // let balance = await staker.balanceOf(accounts[0]);
      // let supply = await staker.totalStakedSupply();
      // assert.equal(balance.toString(), "0", "Contract user balance is not 0");
      // assert.equal(supply.toString(), "0", "Contract total supply is not 0");
    });
  
    it("should update users reward balance from incentive program", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // // Activate rewards program for 100 tokens and 20 seconds
      // await rToken.approve(staker.address, etherize("100"));
      // await staker.addFunding(etherize("100"));
  
      // // Deposit 100 stake tokens
      // await sToken.approve(staker.address, etherize("100"));
      // await staker.stake(etherize("100"));
  
      // // Wait for half program duration so rewards earned should be 100 / 2 = 50
      // await staker.activateReward(etherize("100"), 20);
      // await mineBlock(9);   // Withdraw request will increase block by 1
  
      // let rInitBalance = await rToken.balanceOf(accounts[0]);
      // await staker.withdraw();
      // let rEndBalance = await rToken.balanceOf(accounts[0]);
      // let rDelta = rEndBalance.toString() - rInitBalance.toString();
      // let rewardBalance = await staker.earned(accounts[0]);
      // assert.equal(rDelta.toString(), etherize("50"), "Reward tokens not withdrawn correctly");
      // assert.equal(rewardBalance.toString(), "0", "Reward balance not updated correctly");
  
    });
  });

  describe('Staking Calculation', function () {
    it("should allocate users reward according to their proportion of stake token pool", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // let block = await testHelper.time.latestBlock();
      // // Two users will deposit stake tokens such that one will hold 20% of supply and the other 80%
      // await sToken.transfer(accounts[1], etherize("20"));
      // await sToken.transfer(accounts[2], etherize("80"));
  
      // await sToken.approve(staker.address, etherize("20"), {from: accounts[1]});
      // await sToken.approve(staker.address, etherize("80"), {from: accounts[2]});
      // await staker.stake(etherize("20"), {from: accounts[1]});
      // await staker.stake(etherize("80"), {from: accounts[2]});
  
      // // Active reward programs at 100 tokens for 10 seconds.
      // // At time 0: User 1: 20% R = 0, User 2: 80% R = 0
      // // At time 5: User 1: 20% R = 10, User 2: 80% R = 40
      // // User 2 reduce stake to 0% (earns 1 more block of rewards during withdraw: 8 tokens)
      // // At time 10: User 1: 100% R = 60 - 8, User 2: 0% R = 0
      // await rToken.approve(staker.address, etherize("100"));
      // await staker.addFunding(etherize("100"));
      // await staker.activateReward(etherize("100"), 10);
  
      // await mineBlock(5);   
      // let user_1_reward = await staker.earned(accounts[1]);
      // let user_2_reward = await staker.earned(accounts[2]);
      // assert.equal(user_1_reward.toString(), etherize("10"), "Account 1 first reward calculation incorrect");
      // assert.equal(user_2_reward.toString(), etherize("40"), "Account 2 first reward calculation incorrect");
      // await staker.withdraw({from: accounts[2]}); // Accounts 2 earns 1 more block of reward before withdrawing
  
      // await mineBlock(4);   // Withdraw advanced block by 1
      // user_1_reward = await staker.earned(accounts[1]);
      // user_2_reward = await staker.earned(accounts[2]);
      // assert.equal(user_1_reward.toString(), etherize("52"), "Account 1 second reward calculation incorrect");
      // assert.equal(user_2_reward.toString(), etherize("0"), "Account 2 second reward calculation incorrect");
  
    });
  
    it("should allow user to stake additional stake tokens and allocate reward accordingly", async () => {
      const { IToken, IStake, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // // Two users will deposit stake tokens such that one will hold 20% of supply and the other 80%
      // await sToken.transfer(accounts[1], etherize("40"));
      // await sToken.transfer(accounts[2], etherize("160"));
  
      // await sToken.approve(staker.address, etherize("40"), {from: accounts[1]});
      // await sToken.approve(staker.address, etherize("160"), {from: accounts[2]});
      // await staker.stake(etherize("20"), {from: accounts[1]});
      // await staker.stake(etherize("80"), {from: accounts[2]});
  
      // // NOTE: Integer math leads to rounding error due to low amount.
      // // Active reward programs at 100 tokens for 20 seconds.
      // // At time 0: User 1: 20% R = 0, User 2: 80% R = 0
      // await rToken.approve(staker.address, etherize("100"));
      // await staker.addFunding(etherize("100"));
      // await staker.activateReward(etherize("100"), 20);
  
      // // At time 5: User 1: 20% R = 5, User 2: 80% R = 20
      // // User 1 increase stake by 20 tokens
      // await mineBlock(5);
      // let reward_1 = await staker.earned(accounts[1]);
      // let reward_2 = await staker.earned(accounts[2]);
      // assert(Math.abs(reward_1.toString() - etherize("5")) <= etherize("1"), "Time 5 reward for User 1 incorrect");
      // assert(Math.abs(reward_2.toString() - etherize("20")) <= etherize("1"), "Time 5 reward for User 2 incorrect");
      // await staker.stake(etherize("20"), {from: accounts[1]});
  
      // // At time 10: User 1: 33% R = 13, User 2: 66% R = 37
      // // User 2 increase stake by 20 tokens
      // await mineBlock(4);   // Staked already advanced block by 1
      // reward_1 = await staker.earned(accounts[1]);
      // reward_2 = await staker.earned(accounts[2]);
      // assert(Math.abs(reward_1.toString() - etherize("13")) <= etherize("1"), "Time 10 reward for User 1 incorrect");
      // assert(Math.abs(reward_2.toString() - etherize("37")) <= etherize("1"), "Time 10 reward for User 2 incorrect");
      // await staker.stake(etherize("20"), {from: accounts[2]});
  
      // // At time 15: User 1: 28% R = 20, User 2: 72% R = 55
      // // User 2 increase stake by 60 tokens
      // await mineBlock(4);   // Staked already advanced block by 1
      // reward_1 = await staker.earned(accounts[1]);
      // reward_2 = await staker.earned(accounts[2]);
      // assert(Math.abs(reward_1.toString() - etherize("20")) <= etherize("1"), "Time 15 reward for User 1 incorrect");
      // assert(Math.abs(reward_2.toString() - etherize("55")) <= etherize("1"), "Time 15 reward for User 2 incorrect");
      // await staker.stake(etherize("60"), {from: accounts[2]});
  
      // // At time 20: User 1: 20% R = 25, User 2: 80% R = 75
      // await mineBlock(4);   // Staked already advanced block by 1
      // reward_1 = await staker.earned(accounts[1]);
      // reward_2 = await staker.earned(accounts[2]);
      // assert(Math.abs(reward_1.toString() - etherize("25")) <= etherize("1"), "Time 20 reward for User 1 incorrect");
      // assert(Math.abs(reward_2.toString() - etherize("75")) <= etherize("1"), "Time 20 reward for User 2 incorrect");
    });
  });
});