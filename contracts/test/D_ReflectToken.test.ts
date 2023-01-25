import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre from 'hardhat';
import { BigNumber, Signer } from "ethers";
import { ReflectToken } from '../typechain-types/contracts/D_Reflect_Token';
import { DemoToken } from "../typechain-types/contracts/A_DemoToken";

interface SignerWithAddress extends Signer {
  address: string
}

describe('Reflect', function () {
  async function DeployFixture() {
    const [admin, user1, user2, user3] = await hre.ethers.getSigners();
    const demoName: string = "DemoToken";
    const demoSymbol: string = "DEMO";
    const whitelist: Array<string> = [admin.address, user1.address];

    const decimal: number = 18;
    const name: string = "Reflect";
    const symbol: string = "RFT";
    const supply: BigNumber = hre.ethers.utils.parseUnits("1000000", decimal);
    const limit: BigNumber = hre.ethers.utils.parseUnits("1000", decimal);
    const price: BigNumber = hre.ethers.utils.parseUnits("10", decimal);
    const fee: number = 0;

    const token = await (await hre.ethers.getContractFactory("DemoToken")).deploy(demoName, demoSymbol, whitelist);
    const reflectToken = await (await hre.ethers.getContractFactory("ReflectToken")).deploy(name, symbol, supply, limit, fee, price, token.address);

    const IToken = token as DemoToken;
    const IReflect = reflectToken as ReflectToken;
    await IToken.changeMinter(IReflect.address, true);
    await IToken.mintTo(admin.address, limit.mul(BigNumber.from(10000000)));
    await IReflect.purchaseTokens(limit);
    
    return { IToken, IReflect, admin, user1, user2, user3 };
  };

  describe("Deployment", function () {
    it("Should initialize to correct parameters", async () => { 
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const decimal: number = 18;
      const name: string = "Reflect";
      const symbol: string = "RFT";
      const supply: BigNumber = hre.ethers.utils.parseUnits("1000000", decimal);
      const limit: BigNumber = hre.ethers.utils.parseUnits("1000", decimal);
      const fee: number = 0;
      
      expect(await IReflect.name()).to.be.equal(name);
      expect(await IReflect.symbol()).to.be.equal(symbol);
      expect(await IReflect.totalSupply()).to.be.equal(supply);
      expect(await IReflect.mintLimit()).to.be.equal(limit);
      expect(await IReflect.feeReflectPct()).to.be.equal(fee);
    });
  });

  describe("Transfers", function () {
    it("Should do simple ERC20 transfers", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const transferAmount: number = 20; 
      
      // Add initial balances
      await IReflect.transfer(user1.address, transferAmount);

      await expect(IReflect.connect(user1).transfer(user2.address, transferAmount)).to.changeTokenBalances(
        IReflect,
        [user1.address, user2.address],
        [-transferAmount, +transferAmount]
      )
    });
  });

  describe('Admin features', function () {
    it("Should allow admin to set reflect fees between 0 and 99%.", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const newFee: number = 10;

      await expect(IReflect.setReflectFees(newFee)).to.emit(IReflect, "FeeChanged").withArgs(0, newFee);
      await expect(IReflect.setReflectFees(100)).to.be.revertedWith("FeeOnTransfer: Total fee percentage must be less than 100%");
    });
  
    it("Should allow admin to exclude account from receiving redistribution fees.", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      
      expect(await IReflect.isExcludedAct(user3.address)).to.be.equal(false);
      await expect(IReflect.excludeAccount(user3.address)).to.emit(IReflect, "AccountExcluded").withArgs(user3.address);
      expect(await IReflect.isExcludedAct(user3.address)).to.be.equal(true);
    });
  
    it("should allow admin to re-include excluded account.", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      
      await IReflect.excludeAccount(user3.address);
      expect(await IReflect.isExcludedAct(user3.address)).to.be.equal(true);
      await expect(IReflect.includeAccount(user3.address)).to.emit(IReflect, "AccountIncluded").withArgs(user3.address);
      expect(await IReflect.isExcludedAct(user3.address)).to.be.equal(false);
    });
  });

  describe("Reflection mechanism", function () {
    it("Should reflect a percentage of transaction to all holders.", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const newFee: number = 10;
      const distributionAmount: BigNumber = hre.ethers.utils.parseUnits("100", 18);
      const transferAmount: BigNumber = hre.ethers.utils.parseUnits("50", 18);

      // Initial Distribution
      await IReflect.transfer(user1.address, distributionAmount);
      await IReflect.transfer(user2.address, distributionAmount);
      await IReflect.transfer(user3.address, distributionAmount);
      let initialBalances: Map<string, BigNumber> = new Map<string, BigNumber>();
      initialBalances.set(admin.address, await IReflect.balanceOf(admin.address));
      initialBalances.set(user1.address, await IReflect.balanceOf(user1.address)); 
      initialBalances.set(user2.address, await IReflect.balanceOf(user2.address)); 
      initialBalances.set(user3.address, await IReflect.balanceOf(user3.address)); 

      // Set Fee
      await IReflect.setReflectFees(newFee);

      // Transfer from user1 to user 2
      await IReflect.connect(user1).transfer(user2.address, transferAmount);

      // Check balances
      const transferFee: BigNumber = BigNumber.from(transferAmount).mul(BigNumber.from(newFee)).div(BigNumber.from(100));
      const distribution = await calculateNetTransfer(transferFee, [admin, user1, user2, user3], IReflect);
      const getNumber: (address: string, map: Map<string, BigNumber>) => BigNumber = (address, map) => {
        return map.get(address) || BigNumber.from(0);
      }

      // Admin account check => +reflectFee
      expect(distribution.balances.get(admin.address)).to.be.equal(
        getNumber(admin.address, initialBalances).add(getNumber(admin.address, distribution.fees)));
      
      // User 1 account check => +reflectFee -transferAmount
      expect(distribution.balances.get(user1.address)).to.be.equal(
        getNumber(user1.address, initialBalances).sub(transferAmount).add(getNumber(user1.address, distribution.fees)));
      
      // User 2 account check => +reflectFee -transferAmount -transferFee
      expect(distribution.balances.get(user2.address)).to.be.equal(
        getNumber(user2.address, initialBalances).add(transferAmount).sub(transferFee).add(getNumber(user2.address, distribution.fees)));
      
      // // User 3 account check => +reflectFee
      expect(distribution.balances.get(user3.address)).to.be.equal(
        getNumber(user3.address, initialBalances).add(getNumber(user3.address, distribution.fees)));
    });

    it("Should exclude excluded accounts from reflection.", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const newFee: number = 10;
      const distributionAmount: BigNumber = hre.ethers.utils.parseUnits("100", 18);
      const transferAmount: BigNumber = hre.ethers.utils.parseUnits("50", 18);

      // Initial Distribution
      await IReflect.transfer(user1.address, distributionAmount);
      await IReflect.transfer(user2.address, distributionAmount);
      await IReflect.transfer(user3.address, distributionAmount);
      let initialBalances: Map<string, BigNumber> = new Map<string, BigNumber>();
      initialBalances.set(admin.address, await IReflect.balanceOf(admin.address));
      initialBalances.set(user1.address, await IReflect.balanceOf(user1.address)); 
      initialBalances.set(user2.address, await IReflect.balanceOf(user2.address)); 
      initialBalances.set(user3.address, await IReflect.balanceOf(user3.address)); 

      // Set Fee and exclude account 1
      await IReflect.setReflectFees(newFee);
      await IReflect.excludeAccount(user1.address);

      // Transfer from user1 to user 2
      await IReflect.connect(user1).transfer(user2.address, transferAmount);

      // Check balances
      const transferFee: BigNumber = BigNumber.from(transferAmount).mul(BigNumber.from(newFee)).div(BigNumber.from(100));
      const distribution = await calculateNetTransfer(transferFee, [admin, user1, user2, user3], IReflect);
      const getNumber: (address: string, map: Map<string, BigNumber>) => BigNumber = (address, map) => {
        return map.get(address) || BigNumber.from(0);
      }

      // User 1 account check => -transferAmount
      expect(distribution.balances.get(user1.address)).to.be.equal(
        getNumber(user1.address, initialBalances).sub(transferAmount));
      
    });

    it("Should refund missed fees to excluded accounts after inclusion.", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const newFee: number = 10;
      const distributionAmount: BigNumber = hre.ethers.utils.parseUnits("100", 18);
      const transferAmount: BigNumber = hre.ethers.utils.parseUnits("50", 18);

      // Initial Distribution
      await IReflect.transfer(user1.address, distributionAmount);
      await IReflect.transfer(user2.address, distributionAmount);
      await IReflect.transfer(user3.address, distributionAmount);
      let initialBalances: Map<string, BigNumber> = new Map<string, BigNumber>();
      initialBalances.set(admin.address, await IReflect.balanceOf(admin.address));
      initialBalances.set(user1.address, await IReflect.balanceOf(user1.address)); 
      initialBalances.set(user2.address, await IReflect.balanceOf(user2.address)); 
      initialBalances.set(user3.address, await IReflect.balanceOf(user3.address)); 

      // Set Fee and exclude user 1
      await IReflect.setReflectFees(newFee);
      await IReflect.excludeAccount(user1.address);

      // Transfer from user1 to user 2 and re-include user 1
      await IReflect.connect(user1).transfer(user2.address, transferAmount);
      await IReflect.includeAccount(user1.address);

      // Check balances
      const transferFee: BigNumber = BigNumber.from(transferAmount).mul(BigNumber.from(newFee)).div(BigNumber.from(100));
      const distribution = await calculateNetTransfer(transferFee, [admin, user1, user2, user3], IReflect);
      const getNumber: (address: string, map: Map<string, BigNumber>) => BigNumber = (address, map) => {
        return map.get(address) || BigNumber.from(0);
      }

      // Admin account check => +reflectFee
      expect(distribution.balances.get(admin.address)).to.be.equal(
        getNumber(admin.address, initialBalances).add(getNumber(admin.address, distribution.fees)));
      
      // User 1 account check => +reflectFee -transferAmount
      expect(distribution.balances.get(user1.address)).to.be.equal(
        getNumber(user1.address, initialBalances).sub(transferAmount).add(getNumber(user1.address, distribution.fees)));
      
      // User 2 account check => +reflectFee -transferAmount -transferFee
      expect(distribution.balances.get(user2.address)).to.be.equal(
        getNumber(user2.address, initialBalances).add(transferAmount).sub(transferFee).add(getNumber(user2.address, distribution.fees)));
      
      // // User 3 account check => +reflectFee
      expect(distribution.balances.get(user3.address)).to.be.equal(
        getNumber(user3.address, initialBalances).add(getNumber(user3.address, distribution.fees)));
    });
  });
});

async function calculateNetTransfer(feeAmount: BigNumber, holders: Array<SignerWithAddress>, token: ReflectToken): Promise<{ balances: Map<string, BigNumber>, fees: Map<string, BigNumber> }> {
  const supply: BigNumber = (await token.totalSupply());
  let result: { balances: Map<string, BigNumber>, fees: Map<string, BigNumber> };
  let holderBalance: Map<string, BigNumber> = new Map<string, BigNumber>();
  let feeDistribution: Map<string, BigNumber> = new Map<string, BigNumber>();
  
  for (const holder of holders)
  {
    let balance: BigNumber = (await token.balanceOf(holder.address));
    let holderFee: BigNumber = balance.mul(feeAmount).div(supply);
    holderBalance.set(holder.address, balance);
    feeDistribution.set(holder.address, holderFee);
  }
  result = { balances: holderBalance, fees: feeDistribution };
  return result;
}




