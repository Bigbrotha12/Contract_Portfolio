/*

contract("Pausable features", (accounts) => {
  it("should allow admin to pause token transfers", async () => {
    const instance = await feeOnBuySell.deployed();
    await instance.lockToken();
    await truffleAssert.reverts(
      instance.transfer(accounts[1], 30 * 10 ** 13),
      "Pausable: paused"
    );
    await instance.approve(accounts[1], 30 * 10 ** decimal);
    await truffleAssert.reverts(
      instance.transferFrom(accounts[0], accounts[1], 30 * 10 ** decimal, {
        from: accounts[1],
      }),
      "Pausable: paused"
    );
  });

  it("should allow admin to un-pause token transfers", async () => {
    const instance = await feeOnBuySell.deployed();
    await instance.unlockToken();
    await truffleAssert.passes(
      instance.transfer(accounts[1], 30 * 10 ** decimal),
      "transfer attempt failed"
    );
  });
});

contract("Ownable features", (accounts) => {
  it("should only allow admin to call admin functions", async () => {
    const instance = await feeOnBuySell.deployed();
    // accounts[1] is not the token admin and should not be able to call these functions
    await truffleAssert.reverts(
      instance.setExchange(accounts[0], { from: accounts[1] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.reverts(
      instance.removeExchange(accounts[0], { from: accounts[1] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.reverts(
      instance.changeMarketing(accounts[0], { from: accounts[1] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.reverts(
      instance.changeAcquisition(0, accounts[0], { from: accounts[1] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.reverts(
      instance.setBuyFees(1, 3, 5, { from: accounts[1] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.reverts(
      instance.setSellFees(3, 1, 5, { from: accounts[1] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.reverts(
      instance.excludeAccount(accounts[0], { from: accounts[1] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.reverts(
      instance.includeAccount(accounts[0], { from: accounts[1] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.reverts(
      instance.lockToken({ from: accounts[1] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.reverts(
      instance.unlockToken({ from: accounts[1] }),
      "Ownable: caller is not the owner"
    );

    // accounts[0] is token admin and should be able to call these functions
    await truffleAssert.passes(
      instance.setExchange(accounts[0], { from: accounts[0] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.passes(
      instance.removeExchange(accounts[0], { from: accounts[0] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.passes(
      instance.changeMarketing(accounts[0], { from: accounts[0] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.passes(
      instance.changeAcquisition(0, accounts[0], { from: accounts[0] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.passes(
      instance.setBuyFees(1, 3, 5, { from: accounts[0] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.passes(
      instance.setSellFees(3, 1, 5, { from: accounts[0] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.passes(
      instance.excludeAccount(accounts[1], { from: accounts[0] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.passes(
      instance.includeAccount(accounts[1], { from: accounts[0] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.passes(
      instance.lockToken({ from: accounts[0] }),
      "Ownable: caller is not the owner"
    );
    await truffleAssert.passes(
      instance.unlockToken({ from: accounts[0] }),
      "Ownable: caller is not the owner"
    );
  });

  it("should allow admin to transfer admin privileges", async () => {
    const instance = await feeOnBuySell.deployed();
    await instance.transferOwnership(accounts[1]);
    const newOwner = await instance.owner();
    assert.equal(
      newOwner,
      accounts[1],
      "Admin privileges were not transferred"
    );
  });

  it("should allow admin to renounce admin privileges", async () => {
    const instance = await feeOnBuySell.deployed();
    await instance.renounceOwnership({ from: accounts[1] });
    const newOwner = await instance.owner();
    assert.equal(
      newOwner,
      "0x0000000000000000000000000000000000000000",
      "Admin privileges not renounced"
    );
  });
});

contract("Fee redistribution features", (Accounts) => {
  // Redistribution fee is disabled for first five tests
  // Buy fees: 1% marketing, 7% acquisition, 1% reflections
  // Sell fees: 1% marketing, 3% acquisition, 5% reflections
  // Exchange address: accounts[7]
  const _buyFeeReflect = 1;
  const _buyFeeMarketing = 1;
  const _buyFeeAcquisition = 7;
  const _sellFeeReflect = 5;
  const _sellFeeMarketing = 1;
  const _sellFeeAcquisition = 3;

  it("should not charge fees on transfer when not buying or selling token", async () => {
    const instance = await feeOnBuySell.deployed();
    await instance.setBuyFees(0, _buyFeeMarketing, _buyFeeAcquisition);
    await instance.setSellFees(0, _sellFeeMarketing, _sellFeeAcquisition);
    // initial exchange "liquidity"
    await instance.transfer(accounts[7], (500 * 10 ** decimal).toString());
    await instance.setExchange(accounts[7]);

    const initBalEight = await instance.balanceOf(accounts[8]);
    await instance.transfer(accounts[8], (30 * 10 ** decimal).toString());
    const endBalEight = await instance.balanceOf(accounts[8]);
    const transferBalEight = endBalEight - initBalEight;

    assert.equal(
      transferBalEight,
      (30 * 10 ** decimal).toString(),
      "Some fees were deducted from the transfer"
    );
  });

  it("should transfer 1% of transaction to marketing wallet when buying token", async () => {
    const instance = await feeOnBuySell.deployed();

    // Buying == Transferring from exchange addresses
    const initBalZero = await instance.balanceOf(accounts[0]);
    const initBalMarketing = await instance.balanceOf(accounts[1]);
    const marketingFee =
      ((100 * 10 ** decimal).toString() * _buyFeeMarketing) / 100;
    await instance.transfer(accounts[0], (100 * 10 ** decimal).toString(), {
      from: accounts[7],
    });
    const endBalZero = await instance.balanceOf(accounts[0]);
    const endBalMarketing = await instance.balanceOf(accounts[1]);
    const transferZero = endBalZero - initBalZero;
    const transferMarketing = endBalMarketing - initBalMarketing;

    assert.equal(
      transferZero.toString(),
      (
        ((100 * (100 - _buyFeeMarketing - _buyFeeAcquisition)) / 100) *
        10 ** decimal
      ).toString(),
      "Transfer fee not deducted correctly"
    );
    assert.equal(
      transferMarketing.toString(),
      marketingFee.toString(),
      "Marketing wallet did not receive correct fee"
    );
  });

  it("should transfer 7% of transaction to acquisition wallets when buying token", async () => {
    const instance = await feeOnBuySell.deployed();

    // Buying == Transferring from exchange addresses
    const initBalZero = await instance.balanceOf(accounts[0]);
    const initBalAcq = new Array(5);
    for (let i = 0; i < 5; i++) {
      initBalAcq[i] = await instance.balanceOf(accounts[i + 2]);
    }
    const acquisitionFee = (100 * 10 ** decimal * _buyFeeAcquisition) / 100;
    await instance.transfer(accounts[0], (100 * 10 ** decimal).toString(), {
      from: accounts[7],
    });
    const endBalZero = await instance.balanceOf(accounts[0]);
    const endBalAcq = new Array(5);
    for (let i = 0; i < 5; i++) {
      endBalAcq[i] = await instance.balanceOf(accounts[i + 2]);
    }
    const transferZero = endBalZero - initBalZero;
    const transferAcq = new Array(5);
    for (let i = 0; i < 5; i++) {
      transferAcq[i] = endBalAcq[i] - initBalAcq[i];
      assert.equal(
        transferAcq[i].toString(),
        (acquisitionFee / 5).toString(),
        "Acquisition wallet did not receive correct fee"
      );
    }
    assert.equal(
      transferZero.toString(),
      (
        ((100 * (100 - _buyFeeMarketing - _buyFeeAcquisition)) / 100) *
        10 ** decimal
      ).toString(),
      "Transfer fee not deducted correctly"
    );
  });

  it("should transfer 1% of transaction to marketing wallet when selling token", async () => {
    const instance = await feeOnBuySell.deployed();
    const initBalZero = await instance.balanceOf(accounts[0]);
    const initBalMarketing = await instance.balanceOf(accounts[1]);
    const marketingFee = (100 * 10 ** decimal * _sellFeeMarketing) / 100;
    // Selling == Transferring to exchange addresses
    await instance.transfer(accounts[7], (100 * 10 ** decimal).toString());
    const endBalZero = await instance.balanceOf(accounts[0]);
    const endBalMarketing = await instance.balanceOf(accounts[1]);
    const transferZero = initBalZero - endBalZero;
    const transferMarketing = endBalMarketing - initBalMarketing;

    assert.equal(
      transferZero.toString(),
      (100 * 10 ** decimal).toString(),
      "Transfer fee not deducted correctly"
    );
    assert.equal(
      transferMarketing.toString(),
      marketingFee.toString(),
      "Marketing wallet did not receive correct fee"
    );
  });

  it("should transfer 3% of transaction to acquisition wallets when selling token", async () => {
    const instance = await feeOnBuySell.deployed();

    // Selling == Transfering to exchange addresses
    const initBalZero = await instance.balanceOf(accounts[0]);
    const initBalAcq = new Array(5);
    for (let i = 0; i < 5; i++) {
      initBalAcq[i] = await instance.balanceOf(accounts[i + 2]);
    }
    const acquisitionFee = (100 * 10 ** decimal * _sellFeeAcquisition) / 100;
    await instance.transfer(accounts[7], (100 * 10 ** decimal).toString());
    const endBalZero = await instance.balanceOf(accounts[0]);
    const endBalAcq = new Array(5);
    const transferAcq = new Array(5);
    const transferZero = initBalZero - endBalZero;
    for (let i = 0; i < 5; i++) {
      endBalAcq[i] = await instance.balanceOf(accounts[i + 2]);
      transferAcq[i] = endBalAcq[i] - initBalAcq[i];
      assert.equal(
        transferAcq[i].toString(),
        (acquisitionFee / 5).toString(),
        "Acquisition wallet did not receive correct fee"
      );
    }
    assert.equal(
      transferZero.toString(),
      (100 * 10 ** decimal).toString(),
      "Transfer not deducted correctly"
    );
  });

  it("should transfer 1% of transaction to all holders wallet (reflection) when buying token", async () => {
    const instance = await feeOnBuySell.deployed();
    await instance.setBuyFees(
      _buyFeeReflect,
      _buyFeeMarketing,
      _buyFeeAcquisition
    );
    await instance.setSellFees(
      _sellFeeReflect,
      _sellFeeMarketing,
      _sellFeeAcquisition
    );
    const reflectFee = (100 * 10 ** decimal * _buyFeeReflect) / 100;
    const supply = await instance.totalSupply();

    // Accounts[8] is normal account and should only have received reflections
    const initBalance = await instance.balanceOf(accounts[8]);

    // Buying == Transferring from exchange addresses
    await instance.transfer(accounts[0], (100 * 10 ** decimal).toString(), {
      from: accounts[7],
    });

    const endBalance = await instance.balanceOf(accounts[8]);
    const transferBalance = endBalance - initBalance;

    assert(
      Math.abs(reflectFee * (endBalance / supply) - transferBalance) === 0,
      "Reflection was not calculated correctly"
    );
  });

  it("should transfer 5% of transaction to all holders wallets (reflection) when selling token", async () => {
    const instance = await feeOnBuySell.deployed();
    const reflectFee = (100 * 10 ** decimal * _sellFeeReflect) / 100;
    const supply = await instance.totalSupply();

    // Accounts[8] is normal account and should only have receive reflections
    const initBalance = await instance.balanceOf(accounts[8]);

    // Buying == Transferring from exchange addresses
    await instance.transfer(accounts[7], (100 * 10 ** decimal).toString());

    const endBalance = await instance.balanceOf(accounts[8]);
    const transferBalance = endBalance - initBalance;

    assert(
      Math.abs(reflectFee * (endBalance / supply) - transferBalance) === 0,
      "Reflection was not calculated correctly"
    );
  });

  it("should not reflect tokens to excluded accounts", async () => {
    const instance = await feeOnBuySell.deployed();

    // Accounts[8] is normal account and should only have receive reflections
    const initBalance = await instance.balanceOf(accounts[8]);
    await instance.excludeAccount(accounts[8]);

    // Buying == Transferring from exchange addresses
    await instance.transfer(accounts[0], (100 * 10 ** decimal).toString(), {
      from: accounts[7],
    });

    const endBalance = await instance.balanceOf(accounts[8]);
    const transferBalance = endBalance - initBalance;

    assert.equal(
      transferBalance.toString(),
      "0",
      "Excluded account still received reflections"
    );
  });

  it("should reimburse re-included accounts for any missed reflections", async () => {
    const instance = await feeOnBuySell.deployed();
    const buyReflectFee = (100 * 10 ** decimal * _buyFeeReflect) / 100;
    const supply = await instance.totalSupply();

    const initBalance = await instance.balanceOf(accounts[8]);
    await instance.includeAccount(accounts[8]);

    const endBalance = await instance.balanceOf(accounts[8]);
    const transferBalance = endBalance - initBalance;
    const missedReflections = buyReflectFee * (endBalance / supply);

    assert(
      Math.abs(missedReflections - transferBalance) === 0,
      "Reflection was not reimbursed correctly"
    );
  });

  it("excluding and including accounts should not significant affect total supply", async () => {
    const instance = await feeOnBuySell.deployed();
    const initSupply = await instance.totalSupply();

    await instance.excludeAccount(accounts[0]);
    await instance.excludeAccount(accounts[1]);
    await instance.excludeAccount(accounts[7]);

    // Selling == Transferring to exchange addresses
    await instance.transfer(accounts[7], (10 * 10 ** decimal).toString());

    let aSupply = 0;
    for (let i = 0; i < 9; i++) {
      const e = await instance.balanceOf(accounts[i]);
      aSupply = aSupply + e * 1;
    }

    await instance.includeAccount(accounts[0]);
    await instance.includeAccount(accounts[1]);
    await instance.includeAccount(accounts[7]);

    let bSupply = 0;
    for (i = 0; i < 9; i++) {
      const e = await instance.balanceOf(accounts[i]);
      bSupply = bSupply + e * 1;
    }

    assert(
      Math.abs(initSupply - aSupply) < 100,
      "Total supply was significantly changed after exclusion"
    );
    assert(
      Math.abs(bSupply - aSupply) < 100,
      "Total supply was significantly changed after inclusion"
    );
  });
});

contract("Additional admin features", (accounts) => {
  it("should allow admin to set exchange account and calculate fees accordingly", async () => {
    const instance = await feeOnBuySell.deployed();
    const transferAmount = 50 * 10 ** decimal;
    const transferFees = (transferAmount * 9) / 100;

    const initBal = await instance.balanceOf(accounts[7]);
    await instance.transfer(accounts[7], transferAmount);
    const endBal = await instance.balanceOf(accounts[7]);
    assert.equal(
      endBal - initBal,
      transferAmount,
      "Fees were deducted when they should not"
    );

    await instance.setExchange(accounts[7]);
    const initBal2 = await instance.balanceOf(accounts[7]);
    await instance.transfer(accounts[7], transferAmount);
    const endBal2 = await instance.balanceOf(accounts[7]);
    assert.equal(
      endBal2 - initBal2,
      transferAmount - transferFees,
      "Fees were not deducted when they should"
    );
  });

  it("should allow admin to remove exchange account and calculate fees accordingly", async () => {
    const instance = await feeOnBuySell.deployed();
    const transferAmount = 50 * 10 ** decimal;

    await instance.removeExchange(accounts[7]);
    const initBal = await instance.balanceOf(accounts[7]);
    await instance.transfer(accounts[7], transferAmount);
    const endBal = await instance.balanceOf(accounts[7]);
    assert.equal(
      endBal - initBal,
      transferAmount,
      "Fees were deducted when they should not"
    );
  });

  it("should allow admin to change marketing wallet", async () => {
    const instance = await feeOnBuySell.deployed();

    const oldMarketAddress = await instance.getMarketingWallet();
    // initial market address == accounts[1]
    await instance.changeMarketing(accounts[8]);
    const newMarketAddress = await instance.getMarketingWallet();
    assert.notEqual(
      oldMarketAddress,
      newMarketAddress,
      "Market address was not changed"
    );
    assert.equal(
      newMarketAddress,
      accounts[8],
      "Market address was not changed to correct account"
    );
  });

  it("should allow admin to change acquisition wallets", async () => {
    const instance = await feeOnBuySell.deployed();

    const oldAcqAddress = await instance.getAcquisitionWallet(0);
    // initial acquisition[0] address == accounts[2]
    await instance.changeAcquisition(0, accounts[8]);
    const newAcqAddress = await instance.getAcquisitionWallet(0);
    assert.notEqual(
      oldAcqAddress,
      newAcqAddress,
      "Acquisition[0] address was not changed"
    );
    assert.equal(
      newAcqAddress,
      accounts[8],
      "Acquisition[0] address was not changed to correct account"
    );
  });

  it("should allow admin to set total Buy fees between 0 and 99%", async () => {
    const instance = await feeOnBuySell.deployed();

    truffleAssert.passes(
      instance.setBuyFees(0, 0, 0, { from: accounts[0] }),
      "Ownable: caller is not the owner"
    );
    truffleAssert.passes(
      instance.setBuyFees(33, 33, 33, { from: accounts[0] }),
      "Ownable: caller is not the owner"
    );
    truffleAssert.reverts(
      instance.setBuyFees(33, 34, 34, { from: accounts[0] })
    );
    truffleAssert.reverts(
      instance.setBuyFees(100, 100, 100, { from: accounts[0] })
    );
  });

  it("should allow admin to set total Sell fees between 0 and 99%", async () => {
    const instance = await feeOnBuySell.deployed();

    truffleAssert.passes(
      instance.setSellFees(0, 0, 0, { from: accounts[0] }),
      "Ownable: caller is not the owner"
    );
    truffleAssert.passes(
      instance.setSellFees(33, 33, 33, { from: accounts[0] }),
      "Ownable: caller is not the owner"
    );
    truffleAssert.reverts(
      instance.setSellFees(33, 34, 34, { from: accounts[0] })
    );
    truffleAssert.reverts(
      instance.setSellFees(100, 100, 100, { from: accounts[0] })
    );
  });

  it("should allow admin to exclude account from receiving redistribution fees", async () => {
    const instance = await feeOnBuySell.deployed();

    const initStatus = await instance.isExcluded(accounts[8]);
    await instance.excludeAccount(accounts[8]);
    const endStatus = await instance.isExcluded(accounts[8]);

    assert(!initStatus && endStatus, "Account was not excluded");
  });

  it("should allow admin to re-include excluded account to receive prior and future redistribution fees", async () => {
    const instance = await feeOnBuySell.deployed();

    const initStatus = await instance.isExcluded(accounts[8]);
    await instance.includeAccount(accounts[8]);
    const endStatus = await instance.isExcluded(accounts[8]);

    assert(initStatus && !endStatus, "Account was not included");
  });
});
*/
