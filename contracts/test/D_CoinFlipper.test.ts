import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre from 'hardhat';
import { DemoToken } from '../typechain-types/contracts/A_DemoToken';
import { CoinFlipper, testCoordinatorSol } from '../typechain-types/contracts/D_Oracle_Contract';

describe("CoinFlipper", function () {
  async function DeployFixture() {
    const [admin, user1, user2, user3] = await hre.ethers.getSigners();
    const name: string = "DemoToken";
    const symbol: string = "DEMO";
    const limit: number = 1000;
    const whitelist: Array<string> = [admin.address, user1.address];
    const subscriptionId: number = 1;
  
    const token = await (await hre.ethers.getContractFactory("DemoToken")).deploy(name, symbol, whitelist, limit);
    const testOracle = await (await hre.ethers.getContractFactory("TestCoordinator")).deploy();
    const coinFlip = await (await hre.ethers.getContractFactory("CoinFlipper")).deploy(subscriptionId, testOracle.address);
    await token.changeMinter(coinFlip.address, true);

    const IToken = token as DemoToken;
    const ICoinFlip = coinFlip as CoinFlipper;
    const IOracle = testOracle as testCoordinatorSol.TestCoordinator;
    return { IToken, ICoinFlip, IOracle, admin, user1, user2, user3 };
  };

  describe("Deployment", function () {
    it("Should deploy with correct Oracle coordinator parameters", async () => {
      const { IToken, ICoinFlip, IOracle, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
    
      
    });
  
  });

  describe("Funding", function () {
    it("should allow users to add funds to place bets", async () => {
      const { IToken, ICoinFlip, IOracle, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
  
      
    });
  
    it("should allow users to withdraw balances", async () => {
      const { IToken, ICoinFlip, IOracle, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
  
    });
  });

  describe("Betting", function () {
    it("should allow users to play in coin flipping game", async () => {
      const { IToken, ICoinFlip, IOracle, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

    });
  
    it("should forbid players from add or removing funds while awaiting coin flip result", async () => {
      const { IToken, ICoinFlip, IOracle, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
  
    });
  });
  

  
});