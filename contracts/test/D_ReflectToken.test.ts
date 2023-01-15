import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre from 'hardhat';
import { ReflectToken } from '../typechain-types/contracts/D_Reflect_Token';

describe('Reflect', function () {
  async function DeployFixture() {
    const [admin, user1, user2, user3] = await hre.ethers.getSigners();
    const name: string = "";
    const symbol: string = "";
    const limit: number = 1000;
    const reflectToken = await (await hre.ethers.getContractFactory("ReflectToken")).deploy(name, symbol, limit);
    
    const IReflect = reflectToken as ReflectToken;
    return { IReflect, admin, user1, user2, user3 };
  };

  describe("Transfers", function () {
    it("should deposit 950 tokens to first account", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

   
      let bal = await IReflect.balanceOf(user1.address);
      let supply = await IReflect.totalSupply();
     });
  
    it("should transfer 30 tokens to second account", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // let initBalOne = await instance.balanceOf(accounts[1]);
      // let initBalZero = await instance.balanceOf(accounts[0]);
      // await instance.transfer(accounts[1], 30*10**decimal);
      // let endBalOne = await instance.balanceOf(accounts[1]);
      // let endBalZero = await instance.balanceOf(accounts[0]);
      // let transferBalOne = endBalOne - initBalOne;
      // let transferBalZero = initBalZero - endBalZero;
      // assert.equal(transferBalOne.toString(), 30*10**decimal,'Account two did not receive 30 tokens');
      // assert.equal(transferBalZero.toString(), 30*10**decimal,'Account one did not send 30 tokens');
    });
  
    it("should allow account two to transfer 20 tokens from first account to third account", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // let instance = await ReflectToken.deployed();
      // let initBalTwo = await instance.balanceOf(accounts[2]);
      // let initBalZero = await instance.balanceOf(accounts[0]);
      // await instance.approve(accounts[1], 20*10**decimal);
      // await instance.transferFrom(accounts[0],accounts[2],20*10**decimal,{from: accounts[1]});
      // let endBalTwo = await instance.balanceOf(accounts[2]);
      // let endBalZero = await instance.balanceOf(accounts[0]);
      // let transferTwo = endBalTwo - initBalTwo;
      // let transferZero = initBalZero - endBalZero;
      // assert.equal(transferTwo.toString(), 20*10**decimal,'Account three did not receive 20 tokens');
      // assert.equal(transferZero.toString(),20*10**decimal,'Account three did not send 20 tokens');
    });
  
    it("should not allow an account to transfer from another account without approval", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // let instance = await ReflectToken.deployed();
      // truffleAssert.reverts(instance.transferFrom(accounts[0],accounts[2], 20*10**decimal,{from: accounts[1]}), "ERC20: insufficient allowance");
    });
  });

  describe('Fee redistribution features', function () {  
    it("should transfer a percentage of transaction to all holders wallet (reflection)", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      
      //let reflectFee = (100*10**decimal) / 100;
      // supply = await instance.totalSupply();
  
      // Accounts[8] is normal account and should only have received reflections
      // let initBalance = await instance.balanceOf(accounts[8]);
  
      // // Buying == Transfering from exchange addresses
      // await instance.transfer(accounts[0], (100*10**decimal).toString(),{from: accounts[7]});
  
      // let endBalance = await instance.balanceOf(accounts[8]);
      // let transferBalance = endBalance - initBalance;
  
      // assert(Math.abs((reflectFee * (endBalance / supply)) - transferBalance) < "1", "Reflection was not calculated correctly");
    });
  
    it("should not reflect tokens to excluded accounts", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // let instance = await ReflectToken.deployed();
      // let supply = await instance.totalSupply();
  
      // // Accounts[8] is normal account and should only have receive reflections
      // let initBalance = await instance.balanceOf(accounts[8]);
      // await instance.excludeAccount(accounts[8]);
  
      // // Buying == Transfering from exchange addresses
      // await instance.transfer(accounts[0], (100*10**decimal).toString(),{from: accounts[7]});
  
      // let endBalance = await instance.balanceOf(accounts[8]);
      // let transferBalance = endBalance - initBalance;
  
      // assert.equal(transferBalance.toString(),"0", "Excluded account still received reflections");
  
    });
  
    it("should reimburse re-included accounts for any missed reflections", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // let instance = await ReflectToken.deployed();
      // let buyReflectFee = (100*10**decimal) * _buyFeeReflect / 100;
      // let supply = await instance.totalSupply();
  
      // let initBalance = await instance.balanceOf(accounts[8]);
      // await instance.includeAccount(accounts[8]);
  
      // let endBalance = await instance.balanceOf(accounts[8]);
      // let transferBalance = endBalance - initBalance;
      // let missedReflections = (buyReflectFee * (endBalance / supply));
  
      // assert(Math.abs(missedReflections - transferBalance) < "1", "Reflection was not reimbursed correctly")
  
    });
  
    it("excluding and including accounts should not affect total supply", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // let instance = await ReflectToken.deployed();
      // let initSupply = await instance.totalSupply();
  
      // await instance.excludeAccount(accounts[0]);
      // await instance.excludeAccount(accounts[1]);
      // await instance.excludeAccount(accounts[7]);
  
      // // Selling == Transfering to exchange addresses
      // await instance.transfer(accounts[7], (10*10**decimal).toString());
  
      // let aSupply = 0;
      // for(i=0; i<9; i++){
      //   let e = await instance.balanceOf(accounts[i]);
      //   aSupply = aSupply + e*1;
      // }
  
      // await instance.includeAccount(accounts[0]);
      // await instance.includeAccount(accounts[1]);
      // await instance.includeAccount(accounts[7]);
  
      // let bSupply = 0;
      // for(i=0; i<9; i++){
      //   let e = await instance.balanceOf(accounts[i]);
      //   bSupply = bSupply + e*1;
      // }
  
      // assert(Math.abs(initSupply - aSupply) < "100", "Total supply was significantly changed after exclusion");
      // assert(Math.abs(bSupply - aSupply) < "100", "Total supply was significantly changed after inclusion");
    });
  
  });

  describe('Admin features', function () {
    it("should allow admin to set reflect fees between 0 and 99%", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      // let instance = await ReflectToken.deployed();
  
      // truffleAssert.passes(instance.setSellFees(0,0,0,{from: accounts[0]}), "Ownable: caller is not the owner");
      // truffleAssert.passes(instance.setSellFees(33,33,33,{from: accounts[0]}), "Ownable: caller is not the owner");
      // truffleAssert.reverts(instance.setSellFees(33,34,34,{from: accounts[0]}));
      // truffleAssert.reverts(instance.setSellFees(100,100,100,{from: accounts[0]}));
  
    });
  
    it("should allow admin to exclude account from receiving redistribution fees", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      // let instance = await ReflectToken.deployed();
  
      // let initStatus = await instance.isExcludedAct(accounts[8]);
      // await instance.excludeAccount(accounts[8]);
      // let endStatus = await instance.isExcludedAct(accounts[8]);
  
      // assert(!initStatus && endStatus, "Account was not excluded");
  
    });
  
    it("should allow admin to re-include excluded account to receive prior and future redistribution fees", async () => {
      const { IReflect, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      // let instance = await ReflectToken.deployed();
  
      // let initStatus = await instance.isExcludedAct(accounts[8]);
      // await instance.includeAccount(accounts[8]);
      // let endStatus = await instance.isExcludedAct(accounts[8]);
  
      // assert(initStatus && !endStatus, "Account was not included");
    });
  });

});




