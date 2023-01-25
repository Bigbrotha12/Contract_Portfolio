import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre, { ethers } from 'hardhat';
import { DemoToken } from '../typechain-types/contracts/A_DemoToken';
import { CoinFlipper, testCoordinatorSol } from '../typechain-types/contracts/G_Oracle_Contract';

describe("CoinFlipper", function () {
  async function DeployFixture() {
    const [admin, user1, user2, user3] = await ethers.getSigners();
    const name: string = "DemoToken";
    const symbol: string = "DEMO";
    const limit: number = 1000;
    const whitelist: Array<string> = [admin.address, user1.address];
    const subscriptionId: number = 1;
  
    const token = await (await ethers.getContractFactory("DemoToken")).deploy(name, symbol, whitelist);
    const testOracle = await (await ethers.getContractFactory("TestCoordinator")).deploy();
    const coinFlip = await (await ethers.getContractFactory("CoinFlipper")).deploy(testOracle.address, token.address, token.address);
    await token.changeMinter(coinFlip.address, true);

    const IToken = token as DemoToken;
    const ICoinFlip = coinFlip as CoinFlipper;
    const IOracle = testOracle as testCoordinatorSol.TestCoordinator;
    return { IToken, ICoinFlip, IOracle, admin, user1, user2, user3 };
  };

  describe("Deployment", function () {
    it("Should deploy with correct Oracle coordinator parameters", async () => {
      const { IToken, ICoinFlip, IOracle, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
    
      expect(await ICoinFlip.subscriptionId()).to.be.equal(1);
    });
  
  });

  describe("Funding", function () {
    it("should allow users to add funds to place bets", async () => {
      const { IToken, ICoinFlip, IOracle, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const betAmount: number = 100;

      await IToken.mintTo(user1.address, betAmount);

      expect(await ICoinFlip.getPlayerBalance(user1.address)).to.be.equal(0);
      await ICoinFlip.connect(user1).placeBet(betAmount);
      expect(await ICoinFlip.getPlayerBalance(user1.address)).to.be.equal(betAmount);
    });
  
    it("should allow users to withdraw balances", async () => {
      const { IToken, ICoinFlip, IOracle, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const betAmount: number = 100;

      await IToken.mintTo(user1.address, betAmount);
      await ICoinFlip.connect(user1).placeBet(betAmount);

      expect(await ICoinFlip.getPlayerBalance(user1.address)).to.be.equal(betAmount);
      await ICoinFlip.connect(user1).payOut(betAmount);
      expect(await ICoinFlip.getPlayerBalance(user1.address)).to.be.equal(0);
    });
  });

  describe("Betting", function () {
    it("Should allow users to play in coin flipping game", async () => {
      const { IToken, ICoinFlip, IOracle, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const betAmount: number = 100;
      const queryId: number = 500;
      const positiveResult: number = 1;
      const negativeResult: number = 2;

      await IToken.mintTo(user1.address, betAmount);
      await ICoinFlip.connect(user1).placeBet(betAmount);

      await expect(ICoinFlip.connect(user1).startCoinFlip()).to.emit(ICoinFlip, "logNewQuery");
      await expect(IOracle.answerTestQuery(queryId, positiveResult, ICoinFlip.address)).to.emit(ICoinFlip, "randomNumber");
    });
  
    it("Should forbid players from add or removing funds while awaiting coin flip result", async () => {
      const { IToken, ICoinFlip, IOracle, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const betAmount: number = 100;
      const queryId: number = 500;
      const positiveResult: number = 1;
      const negativeResult: number = 2;

      await IToken.mintTo(user1.address, betAmount);
      await ICoinFlip.connect(user1).placeBet(betAmount);

      await ICoinFlip.connect(user1).startCoinFlip();
      expect(ICoinFlip.connect(user1).placeBet(betAmount)).to.be.revertedWith("CoinFlipper: Coin flip in progress");
      expect(ICoinFlip.connect(user1).payOut(betAmount)).to.be.revertedWith("CoinFlipper: Coin flip in progress");
    });

    it("Should double player's bet amount on positive results", async () => {
      const { IToken, ICoinFlip, IOracle, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const betAmount: number = 100;
      const queryId: number = 500;
      const positiveResult: number = 1;
      const negativeResult: number = 2;

      await IToken.mintTo(user1.address, betAmount);
      await ICoinFlip.connect(user1).placeBet(betAmount);

      await ICoinFlip.connect(user1).startCoinFlip();
      await IOracle.answerTestQuery(queryId, positiveResult, ICoinFlip.address);
      expect(await ICoinFlip.getPlayerBalance(user1.address)).to.be.equal(betAmount * 2);
    });

    it("Should zero-out player's bet amount on negative results", async () => {
      const { IToken, ICoinFlip, IOracle, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const betAmount: number = 100;
      const queryId: number = 500;
      const positiveResult: number = 1;
      const negativeResult: number = 2;

      await IToken.mintTo(user1.address, betAmount);
      await ICoinFlip.connect(user1).placeBet(betAmount);

      await ICoinFlip.connect(user1).startCoinFlip();
      await IOracle.answerTestQuery(queryId, negativeResult, ICoinFlip.address);
      expect(await ICoinFlip.getPlayerBalance(user1.address)).to.be.equal(betAmount * 0);
    });
  });
});