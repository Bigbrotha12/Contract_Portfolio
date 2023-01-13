const ReflectToken = artifacts.require("ReflectToken");
const truffleAssert = require('truffle-assertions');

const decimal = 4;

contract('ERC20 functionality', accounts => {

  it("should deposit 95% of supply to first account", async () => {
    let instance = await ReflectToken.deployed();
    let bal = await instance.balanceOf(accounts[0]);
    let supply = await instance.totalSupply();
    let expectBal = supply / 100 * 95;
    assert(bal - expectBal == 0, "Account one did not receive 95% of the supply");
  });

  it("should transfer 30 tokens to second account", async () => {
    let instance = await ReflectToken.deployed();
    let initBalOne = await instance.balanceOf(accounts[1]);
    let initBalZero = await instance.balanceOf(accounts[0]);
    await instance.transfer(accounts[1], 30*10**decimal);
    let endBalOne = await instance.balanceOf(accounts[1]);
    let endBalZero = await instance.balanceOf(accounts[0]);
    let transferBalOne = endBalOne - initBalOne;
    let transferBalZero = initBalZero - endBalZero;
    assert.equal(transferBalOne.toString(), 30*10**decimal,'Account two did not receive 30 tokens');
    assert.equal(transferBalZero.toString(), 30*10**decimal,'Account one did not send 30 tokens');
  });

  it("should allow account two to transfer 20 tokens from first account to third account", async () => {
    let instance = await ReflectToken.deployed();
    let initBalTwo = await instance.balanceOf(accounts[2]);
    let initBalZero = await instance.balanceOf(accounts[0]);
    await instance.approve(accounts[1], 20*10**decimal);
    await instance.transferFrom(accounts[0],accounts[2],20*10**decimal,{from: accounts[1]});
    let endBalTwo = await instance.balanceOf(accounts[2]);
    let endBalZero = await instance.balanceOf(accounts[0]);
    let transferTwo = endBalTwo - initBalTwo;
    let transferZero = initBalZero - endBalZero;
    assert.equal(transferTwo.toString(), 20*10**decimal,'Account three did not receive 20 tokens');
    assert.equal(transferZero.toString(),20*10**decimal,'Account three did not send 20 tokens');
  });

  it("should not allow an account to transfer from another account without approval", async () => {
    let instance = await ReflectToken.deployed();
    truffleAssert.reverts(instance.transferFrom(accounts[0],accounts[2], 20*10**decimal,{from: accounts[1]}), "ERC20: insufficient allowance");
  });
});

contract('Pausable features', accounts => {

  it("should allow admin to pause token transfers", async () => {
    let instance = await ReflectToken.deployed();
    await instance.lockToken();
    truffleAssert.reverts(instance.transfer(accounts[1], 30*10**13), "Pausable: paused");
    await instance.approve(accounts[1], 30*10**decimal);
    truffleAssert.reverts(instance.transferFrom(accounts[0],accounts[1], 30*10**decimal, {from: accounts[1]}), "Pausable: paused");
  });

  it("should allow admin to un-pause token transfers", async () => {
    let instance = await ReflectToken.deployed();
    await instance.unlockToken();
    truffleAssert.passes(instance.transfer(accounts[1], 30*10**decimal), "transfer attempt failed");
  });

});

contract('Ownable features', accounts => {

  it("should only allow admin to call admin functions", async () => {
    let instance = await ReflectToken.deployed();
    // accounts[1] is not the token admin and should not be able to call these functions
    await truffleAssert.reverts(instance.setExchange(accounts[0],{from: accounts[1]}), "Ownable: caller is not the owner");
    await truffleAssert.reverts(instance.removeExchange(accounts[0],{from: accounts[1]}), "Ownable: caller is not the owner");
    await truffleAssert.reverts(instance.changeMarketing(accounts[0],{from: accounts[1]}), "Ownable: caller is not the owner");
    await truffleAssert.reverts(instance.changeAcquisition(0,accounts[0],{from: accounts[1]}), "Ownable: caller is not the owner");
    await truffleAssert.reverts(instance.setBuyFees(1,3,5,{from: accounts[1]}), "Ownable: caller is not the owner");
    await truffleAssert.reverts(instance.setSellFees(3,1,5,{from: accounts[1]}), "Ownable: caller is not the owner");
    await truffleAssert.reverts(instance.excludeAccount(accounts[0],{from: accounts[1]}), "Ownable: caller is not the owner");
    await truffleAssert.reverts(instance.includeAccount(accounts[0],{from: accounts[1]}), "Ownable: caller is not the owner");
    await truffleAssert.reverts(instance.lockToken({from: accounts[1]}), "Ownable: caller is not the owner");
    await truffleAssert.reverts(instance.unlockToken({from: accounts[1]}), "Ownable: caller is not the owner");

    // accounts[0] is token admin and should be able to call these functions
    await truffleAssert.passes(instance.setExchange(accounts[0],{from: accounts[0]}), "Ownable: caller is not the owner");
    await truffleAssert.passes(instance.removeExchange(accounts[0],{from: accounts[0]}), "Ownable: caller is not the owner");
    await truffleAssert.passes(instance.changeMarketing(accounts[0],{from: accounts[0]}), "Ownable: caller is not the owner");
    await truffleAssert.passes(instance.changeAcquisition(0,accounts[0],{from: accounts[0]}), "Ownable: caller is not the owner");
    await truffleAssert.passes(instance.setBuyFees(1,3,5,{from: accounts[0]}), "Ownable: caller is not the owner");
    await truffleAssert.passes(instance.setSellFees(3,1,5,{from: accounts[0]}), "Ownable: caller is not the owner");
    await truffleAssert.passes(instance.excludeAccount(accounts[1],{from: accounts[0]}), "Ownable: caller is not the owner");
    await truffleAssert.passes(instance.includeAccount(accounts[1],{from: accounts[0]}), "Ownable: caller is not the owner");
    await truffleAssert.passes(instance.lockToken({from: accounts[0]}), "Ownable: caller is not the owner");
    await truffleAssert.passes(instance.unlockToken({from: accounts[0]}), "Ownable: caller is not the owner");
  });

  it("should allow admin to transfer admin privileges", async () => {
    let instance = await ReflectToken.deployed();
    await instance.transferOwnership(accounts[1]);
    let newOwner = await instance.owner();
    assert.equal(newOwner, accounts[1], "Admin privileges were not transferred");
  });

  it("should allow admin to renounce admin privileges", async () => {
    let instance = await ReflectToken.deployed();
    await instance.renounceOwnership({from: accounts[1]});
    let newOwner = await instance.owner();
    assert.equal(newOwner,"0x0000000000000000000000000000000000000000","Admin privileges not renounced");
  });
});

contract('Fee redistribution features', accounts => {

  // Resdistribution fee is disabled for first five tests
  // Buy fees: 1% marketing, 7% acquisition, 1% reflections
  // Sell fees: 1% marketing, 3% acquisition, 5% reflections
  // Exchange address: accounts[7]
  let _buyFeeReflect = 1, _buyFeeMarketing = 1, _buyFeeAcquisition = 7;
  let _sellFeeReflect = 5, _sellFeeMarketing = 1, _sellFeeAcquisition = 3;

  it("should not charge fees on transfer when not buying or selling token", async () => {
    let instance = await ReflectToken.deployed();
    await instance.setBuyFees(0, _buyFeeMarketing, _buyFeeAcquisition);
    await instance.setSellFees(0, _sellFeeMarketing, _sellFeeAcquisition);
    // initial exchange "liquidity"
    await instance.transfer(accounts[7], (500*10**decimal).toString());
    await instance.setExchange(accounts[7]);

    let initBalEight = await instance.balanceOf(accounts[8]);
    await instance.transfer(accounts[8], (30*10**decimal).toString());
    let endBalEight = await instance.balanceOf(accounts[8]);
    let transferBalEight = endBalEight - initBalEight;

    assert.equal(transferBalEight, (30*10**decimal).toString(), "Some fees were deducted from the transfer");
  });

  it("should transfer 1% of transaction to marketing wallet when buying token", async () => {
    let instance = await ReflectToken.deployed();

    // Buying == Transfering from exchange addresses
    let initBalZero = await instance.balanceOf(accounts[0]);
    let initBalMarketing = await instance.balanceOf(accounts[1]);
    let marketingFee = (100*10**decimal).toString() * _buyFeeMarketing / 100;
    await instance.transfer(accounts[0], (100*10**decimal).toString(),{from: accounts[7]});
    let endBalZero = await instance.balanceOf(accounts[0]);
    let endBalMarketing = await instance.balanceOf(accounts[1]);
    let transferZero = endBalZero - initBalZero;
    let transferMarketing = endBalMarketing - initBalMarketing;

    assert.equal(transferZero.toString(), ((100 * (100 - _buyFeeMarketing - _buyFeeAcquisition) / 100) * 10**decimal).toString(), "Transfer fee not deducted correctly");
    assert.equal(transferMarketing.toString(), marketingFee.toString(), "Marketing wallet did not receive correct fee");
  });

  it("should transfer 7% of transaction to acquisition wallets when buying token", async () => {
    let instance = await ReflectToken.deployed();

    // Buying == Transfering from exchange addresses
    let initBalZero = await instance.balanceOf(accounts[0]);
    let initBalAcq = new Array(5);
    for(let i = 0; i < 5; i++){
      initBalAcq[i] = await instance.balanceOf(accounts[i+2]);
    }
    let acquisitionFee = (100*10**decimal) * _buyFeeAcquisition / 100;
    await instance.transfer(accounts[0], (100*10**decimal).toString(),{from: accounts[7]});
    let endBalZero = await instance.balanceOf(accounts[0]);
    let endBalAcq = new Array(5);
    for(let i = 0; i < 5; i++){
      endBalAcq[i] = await instance.balanceOf(accounts[i+2]);
    }
    let transferZero = endBalZero - initBalZero;
    let transferAcq = new Array(5);
    for(let i = 0; i < 5; i++){
      transferAcq[i] = endBalAcq[i] - initBalAcq[i];
      assert.equal(transferAcq[i].toString(), (acquisitionFee / 5).toString(), "Acquisition wallet did not receive correct fee");
    }
    assert.equal(transferZero.toString(), (100 * (100 - _buyFeeMarketing - _buyFeeAcquisition) / 100 * 10**decimal).toString(), "Transfer fee not deducted correctly");
  });

  it("should transfer 1% of transaction to marketing wallet when selling token", async () => {
    let instance = await ReflectToken.deployed();
    let initBalZero = await instance.balanceOf(accounts[0]);
    let initBalMarketing = await instance.balanceOf(accounts[1]);
    let marketingFee = (100*10**decimal) * _sellFeeMarketing / 100;
    // Selling == Transfering to exchange addresses
    await instance.transfer(accounts[7], (100*10**decimal).toString());
    let endBalZero = await instance.balanceOf(accounts[0]);
    let endBalMarketing = await instance.balanceOf(accounts[1]);
    let transferZero =  initBalZero - endBalZero;
    let transferMarketing = endBalMarketing - initBalMarketing;

    assert.equal(transferZero.toString(), (100*10**decimal).toString(), "Transfer fee not deducted correctly");
    assert.equal(transferMarketing.toString(), marketingFee.toString(), "Marketing wallet did not receive correct fee");
  });

  it("should transfer 3% of transaction to acquisition wallets when selling token", async () => {
    let instance = await ReflectToken.deployed();

    // Selling == Transfering to exchange addresses
    let initBalZero = await instance.balanceOf(accounts[0]);
    let initBalAcq = new Array(5);
    for(let i = 0; i < 5; i++){
      initBalAcq[i] = await instance.balanceOf(accounts[i+2]);
    }
    let acquisitionFee = (100*10**decimal) * _sellFeeAcquisition / 100;
    await instance.transfer(accounts[7], (100*10**decimal).toString());
    let endBalZero = await instance.balanceOf(accounts[0]);
    let endBalAcq = new Array(5);
    let transferAcq = new Array(5);
    let transferZero = initBalZero - endBalZero;
    for(let i = 0; i < 5; i++){
      endBalAcq[i] = await instance.balanceOf(accounts[i+2]);
      transferAcq[i] = endBalAcq[i] - initBalAcq[i];
      assert.equal(transferAcq[i].toString(), (acquisitionFee / 5).toString(), "Acquisition wallet did not receive correct fee");
    }
    assert.equal(transferZero.toString(), (100*10**decimal).toString(), "Transfer not deducted correctly");

  });

  it("should transfer 1% of transaction to all holders wallet (reflection) when buying token", async () => {
    let instance = await ReflectToken.deployed();
    await instance.setBuyFees(_buyFeeReflect, _buyFeeMarketing, _buyFeeAcquisition);
    await instance.setSellFees(_sellFeeReflect, _sellFeeMarketing, _sellFeeAcquisition);
    let reflectFee = (100*10**decimal) * _buyFeeReflect / 100;
    let supply = await instance.totalSupply();

    // Accounts[8] is normal account and should only have received reflections
    let initBalance = await instance.balanceOf(accounts[8]);

    // Buying == Transfering from exchange addresses
    await instance.transfer(accounts[0], (100*10**decimal).toString(),{from: accounts[7]});

    let endBalance = await instance.balanceOf(accounts[8]);
    let transferBalance = endBalance - initBalance;

    assert(Math.abs((reflectFee * (endBalance / supply)) - transferBalance) < "1", "Reflection was not calculated correctly");
  });

  it("should transfer 5% of transaction to all holders wallets (reflection) when selling token", async () => {
    let instance = await ReflectToken.deployed();
    let reflectFee = (100*10**decimal) * _sellFeeReflect / 100;
    let supply = await instance.totalSupply();

    // Accounts[8] is normal account and should only have receive reflections
    let initBalance = await instance.balanceOf(accounts[8]);

    // Buying == Transfering from exchange addresses
    await instance.transfer(accounts[7], (100*10**decimal).toString());

    let endBalance = await instance.balanceOf(accounts[8]);
    let transferBalance = endBalance - initBalance;

    assert(Math.abs((reflectFee * (endBalance / supply)) - transferBalance) < "1", "Reflection was not calculated correctly");

  });

  it("should not reflect tokens to excluded accounts", async () => {
    let instance = await ReflectToken.deployed();
    let supply = await instance.totalSupply();

    // Accounts[8] is normal account and should only have receive reflections
    let initBalance = await instance.balanceOf(accounts[8]);
    await instance.excludeAccount(accounts[8]);

    // Buying == Transfering from exchange addresses
    await instance.transfer(accounts[0], (100*10**decimal).toString(),{from: accounts[7]});

    let endBalance = await instance.balanceOf(accounts[8]);
    let transferBalance = endBalance - initBalance;

    assert.equal(transferBalance.toString(),"0", "Excluded account still received reflections");

  });

  it("should reimburse re-included accounts for any missed reflections", async () => {
    let instance = await ReflectToken.deployed();
    let buyReflectFee = (100*10**decimal) * _buyFeeReflect / 100;
    let supply = await instance.totalSupply();

    let initBalance = await instance.balanceOf(accounts[8]);
    await instance.includeAccount(accounts[8]);

    let endBalance = await instance.balanceOf(accounts[8]);
    let transferBalance = endBalance - initBalance;
    let missedReflections = (buyReflectFee * (endBalance / supply));

    assert(Math.abs(missedReflections - transferBalance) < "1", "Reflection was not reimbursed correctly")

  });

  it("excluding and including accounts should not significant affect total supply", async () => {
    let instance = await ReflectToken.deployed();
    let initSupply = await instance.totalSupply();

    await instance.excludeAccount(accounts[0]);
    await instance.excludeAccount(accounts[1]);
    await instance.excludeAccount(accounts[7]);

    // Selling == Transfering to exchange addresses
    await instance.transfer(accounts[7], (10*10**decimal).toString());

    let aSupply = 0;
    for(i=0; i<9; i++){
      let e = await instance.balanceOf(accounts[i]);
      aSupply = aSupply + e*1;
    }

    await instance.includeAccount(accounts[0]);
    await instance.includeAccount(accounts[1]);
    await instance.includeAccount(accounts[7]);

    let bSupply = 0;
    for(i=0; i<9; i++){
      let e = await instance.balanceOf(accounts[i]);
      bSupply = bSupply + e*1;
    }

    assert(Math.abs(initSupply - aSupply) < "100", "Total supply was significantly changed after exclusion");
    assert(Math.abs(bSupply - aSupply) < "100", "Total supply was significantly changed after inclusion");
  });

});

contract('Additional admin features', accounts => {

  it("should allow admin to set exchange account and calculate fees accordingly", async () => {
    let instance = await ReflectToken.deployed();
    let transferAmount = 50 * 10**decimal;
    let transferFees = transferAmount * 9 / 100;

    let initBal = await instance.balanceOf(accounts[7]);
    await instance.transfer(accounts[7], transferAmount);
    let endBal = await instance.balanceOf(accounts[7]);
    assert.equal(endBal - initBal, transferAmount, "Fees were deducted when they should not");

    await instance.setExchange(accounts[7]);
    let initBal2 = await instance.balanceOf(accounts[7]);
    await instance.transfer(accounts[7], transferAmount);
    let endBal2 = await instance.balanceOf(accounts[7]);
    assert.equal(endBal2 - initBal2, transferAmount - transferFees, "Fees were not deducted when they should");
  });

  it("should allow admin to remove exchange account and calculate fees accordingly", async () => {
    let instance = await ReflectToken.deployed();
    let transferAmount = 50 * 10**decimal;

    await instance.removeExchange(accounts[7]);
    let initBal = await instance.balanceOf(accounts[7]);
    await instance.transfer(accounts[7], transferAmount);
    let endBal = await instance.balanceOf(accounts[7]);
    assert.equal(endBal - initBal, transferAmount, "Fees were deducted when they should not");

  });

  it("should allow admin to change marketing wallet", async () => {
    let instance = await ReflectToken.deployed();

    let oldMarketAddress = await instance.getMarketingWallet();
    // initial market address == accounts[1]
    await instance.changeMarketing(accounts[8]);
    let newMarketAddress = await instance.getMarketingWallet();
    assert.notEqual(oldMarketAddress, newMarketAddress, "Market address was not changed");
    assert.equal(newMarketAddress, accounts[8], "Market address was not changed to correct account");

  });

  it("should allow admin to change acquisition wallets", async () => {
    let instance = await ReflectToken.deployed();

    let oldAcqAddress = await instance.getAcquisitionWallet(0);
    // initial acquisition[0] address == accounts[2]
    await instance.changeAcquisition(0, accounts[8]);
    let newAcqAddress = await instance.getAcquisitionWallet(0);
    assert.notEqual(oldAcqAddress, newAcqAddress, "Acquisition[0] address was not changed");
    assert.equal(newAcqAddress, accounts[8], "Acquisition[0] address was not changed to correct account");
  });

  it("should allow admin to set total Buy fees between 0 and 99%", async () => {
    let instance = await ReflectToken.deployed();

    truffleAssert.passes(instance.setBuyFees(0,0,0,{from: accounts[0]}), "Ownable: caller is not the owner");
    truffleAssert.passes(instance.setBuyFees(33,33,33,{from: accounts[0]}), "Ownable: caller is not the owner");
    truffleAssert.reverts(instance.setBuyFees(33,34,34,{from: accounts[0]}));
    truffleAssert.reverts(instance.setBuyFees(100,100,100,{from: accounts[0]}));

  });

  it("should allow admin to set total Sell fees between 0 and 99%", async () => {
    let instance = await ReflectToken.deployed();

    truffleAssert.passes(instance.setSellFees(0,0,0,{from: accounts[0]}), "Ownable: caller is not the owner");
    truffleAssert.passes(instance.setSellFees(33,33,33,{from: accounts[0]}), "Ownable: caller is not the owner");
    truffleAssert.reverts(instance.setSellFees(33,34,34,{from: accounts[0]}));
    truffleAssert.reverts(instance.setSellFees(100,100,100,{from: accounts[0]}));

  });

  it("should allow admin to exclude account from receiving redistribution fees", async () => {
    let instance = await ReflectToken.deployed();

    let initStatus = await instance.isExcludedAct(accounts[8]);
    await instance.excludeAccount(accounts[8]);
    let endStatus = await instance.isExcludedAct(accounts[8]);

    assert(!initStatus && endStatus, "Account was not excluded");

  });

  it("should allow admin to re-include excluded account to receive prior and future redistribution fees", async () => {
    let instance = await ReflectToken.deployed();

    let initStatus = await instance.isExcludedAct(accounts[8]);
    await instance.includeAccount(accounts[8]);
    let endStatus = await instance.isExcludedAct(accounts[8]);

    assert(initStatus && !endStatus, "Account was not included");
  });
});
