const decimal = 4;
const { expect } = require("chai");
const { ethers } = require("hardhat");
let accounts, token;

describe("ERC20 functionality", () => {
  // Deployer: accounts[0]
  // AcquisitionWallets: accounts[1] - accounts[5]
  // MarketingWallet: accounts[6]
  before(async function () {
    const TokenFactory = await ethers.getContractFactory("FeeOnTransfer");
    accounts = await ethers.getSigners();
    const acqWallets = [
      accounts[1].address,
      accounts[2].address,
      accounts[3].address,
      accounts[4].address,
      accounts[5].address,
    ];
    token = await TokenFactory.deploy(10000, accounts[6].address, acqWallets);
  });

  it("should deposit 95% of supply to first account", async () => {
    const bal = await token.balanceOf(accounts[0].address);
    const supply = await token.totalSupply();
    const expectBal = (supply / 100) * 95;
    expect(bal).to.equal(expectBal);
  });

  it("should transfer 30 tokens to second account", async () => {
    const initBalOne = await token.balanceOf(accounts[1].address);
    const initBalZero = await token.balanceOf(accounts[0].address);
    await token.transfer(accounts[1].address, 30 * 10 ** decimal);
    const endBalOne = await token.balanceOf(accounts[1].address);
    const endBalZero = await token.balanceOf(accounts[0].address);
    const transferBalOne = endBalOne - initBalOne;
    const transferBalZero = initBalZero - endBalZero;
    expect(transferBalOne).to.equal(30 * 10 ** decimal);
    expect(transferBalZero).to.equal(30 * 10 ** decimal);
  });

  it("should allow account two to transfer 20 tokens from first account to third account", async () => {
    const initBalTwo = await token.balanceOf(accounts[2].address);
    const initBalZero = await token.balanceOf(accounts[0].address);
    await token.approve(accounts[1].address, 20 * 10 ** decimal);
    await token
      .connect(accounts[1])
      .transferFrom(
        accounts[0].address,
        accounts[2].address,
        20 * 10 ** decimal
      );
    const endBalTwo = await token.balanceOf(accounts[2].address);
    const endBalZero = await token.balanceOf(accounts[0].address);
    const transferTwo = endBalTwo - initBalTwo;
    const transferZero = initBalZero - endBalZero;
    expect(transferTwo).to.equal(20 * 10 ** decimal);
    expect(transferZero).equal(20 * 10 ** decimal);
  });

  it("should not allow an account to transfer from another account without approval", async () => {
    await expect(
      token
        .connect(accounts[1])
        .transferFrom(accounts[0], accounts[2], 20 * 10 ** decimal)
    ).to.be.reverted;
  });
});

describe("Pausable features", () => {
  // Deployer: accounts[0]
  // AcquisitionWallets: accounts[1] - accounts[5]
  // MarketingWallet: accounts[6]
  before(async function () {
    const TokenFactory = await ethers.getContractFactory("FeeOnTransfer");
    accounts = await ethers.getSigners();
    const acqWallets = [
      accounts[1].address,
      accounts[2].address,
      accounts[3].address,
      accounts[4].address,
      accounts[5].address,
    ];
    token = await TokenFactory.deploy(10000, accounts[6].address, acqWallets);
  });

  it("should allow admin to pause token transfers", async () => {
    await token.lockToken();
    await expect(token.transfer(accounts[1].address, 30 * 10 ** decimal)).to.be
      .reverted;
    await token.approve(accounts[1].address, 30 * 10 ** decimal);
    await expect(
      token
        .connect(accounts[1])
        .transferFrom(accounts[0], accounts[1], 30 * 10 ** decimal)
    ).to.be.reverted;
  });

  it("should allow admin to un-pause token transfers", async () => {
    await token.unlockToken();
    await expect(token.transfer(accounts[1].address, 30 * 10 ** decimal))
      .to.emit(token, "Transfer")
      .withArgs(accounts[0].address, accounts[1].address, 30 * 10 ** decimal);
  });
});

describe("Ownable features", () => {
  // Deployer: accounts[0]
  // AcquisitionWallets: accounts[1] - accounts[5]
  // MarketingWallet: accounts[6]
  before(async function () {
    const TokenFactory = await ethers.getContractFactory("FeeOnTransfer");
    accounts = await ethers.getSigners();
    const acqWallets = [
      accounts[1].address,
      accounts[2].address,
      accounts[3].address,
      accounts[4].address,
      accounts[5].address,
    ];
    token = await TokenFactory.deploy(10000, accounts[6].address, acqWallets);
  });

  it("should only allow admin to call admin functions", async () => {
    await expect(token.connect(accounts[1]).setExchange(accounts[0].address)).to
      .be.reverted;
    await expect(token.connect(accounts[1]).removeExchange(accounts[0].address))
      .to.be.reverted;
    await expect(
      token.connect(accounts[1]).changeMarketing(accounts[0].address)
    ).to.be.reverted;
    await expect(
      token.connect(accounts[1]).changeAcquisition(0, accounts[0].address)
    ).to.be.reverted;
    await expect(token.connect(accounts[1]).setBuyFees(1, 3, 5)).to.be.reverted;
    await expect(token.connect(accounts[1]).setSellFees(3, 1, 5)).to.be
      .reverted;
    await expect(token.connect(accounts[1]).excludeAccount(accounts[0].address))
      .to.be.reverted;
    await expect(token.connect(accounts[1]).includeAccount(accounts[0].address))
      .to.be.reverted;
    await expect(token.connect(accounts[1]).lockToken()).to.be.reverted;
    await expect(token.connect(accounts[1]).unlockToken()).to.be.reverted;

    // accounts[0] is token admin and should be able to call these functions
    await token.setExchange(accounts[0].address);
    await token.removeExchange(accounts[0].address);
    await token.changeMarketing(accounts[0].address);
    await token.changeAcquisition(0, accounts[0].address);
    await token.setBuyFees(1, 3, 5);
    await token.setSellFees(3, 1, 5);
    await token.excludeAccount(accounts[1].address);
    await token.includeAccount(accounts[1].address);
    await token.lockToken();
    await token.unlockToken();
  });

  it("should allow admin to transfer admin privileges", async () => {
    expect(await token.transferOwnership(accounts[1].address))
      .to.emit(token, "OwnershipTransferred")
      .withArgs(accounts[0].address, accounts[1].address);
  });

  it("should allow admin to renounce admin privileges", async () => {
    expect(await token.connect(accounts[1]).renounceOwnership())
      .to.emit(token, "OwnershipTransferred")
      .withArgs(
        accounts[1].address,
        "0x0000000000000000000000000000000000000000"
      );
  });
});

describe("Fee redistribution features", () => {
  // Deployer: accounts[0]
  // AcquisitionWallets: accounts[1] - accounts[5]
  // MarketingWallet: accounts[6]
  before(async function () {
    const TokenFactory = await ethers.getContractFactory("FeeOnTransfer");
    accounts = await ethers.getSigners();
    const acqWallets = [
      accounts[1].address,
      accounts[2].address,
      accounts[3].address,
      accounts[4].address,
      accounts[5].address,
    ];
    token = await TokenFactory.deploy(10000, accounts[6].address, acqWallets);
  });

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
    await token.setBuyFees(0, _buyFeeMarketing, _buyFeeAcquisition);
    await token.setSellFees(0, _sellFeeMarketing, _sellFeeAcquisition);
    // initial exchange "liquidity"
    await token.transfer(accounts[7].address, 500 * 10 ** decimal);
    await token.setExchange(accounts[7].address);

    const initBalEight = await token.balanceOf(accounts[8].address);
    await token.transfer(accounts[8].address, 30 * 10 ** decimal);
    const endBalEight = await token.balanceOf(accounts[8].address);
    const transferBalEight = endBalEight - initBalEight;

    expect(transferBalEight).to.equal(30 * 10 ** decimal);
  });

  it("should transfer 1% of transaction to marketing wallet when buying token", async () => {
    const initBalZero = await token.balanceOf(accounts[0].address);
    const initBalMarketing = await token.balanceOf(accounts[1].address);
    const marketingFee = (100 * 10 ** decimal * _buyFeeMarketing) / 100;
    await token
      .connect(accounts[7])
      .transfer(accounts[0].address, 100 * 10 ** decimal);
    const endBalZero = await token.balanceOf(accounts[0].address);
    const endBalMarketing = await token.balanceOf(accounts[1].address);
    const transferZero = endBalZero - initBalZero;
    const transferMarketing = endBalMarketing - initBalMarketing;

    expect(transferZero).to.equal(
      ((100 * (100 - _buyFeeMarketing - _buyFeeAcquisition)) / 100) *
        10 ** decimal
    );
    expect(transferMarketing).to.equal(marketingFee);
  });

  it("should transfer 7% of transaction to acquisition wallets when buying token", async () => {
    // Buying == Transferring from exchange addresses
    const initBalZero = await token.balanceOf(accounts[0].address);
    const initBalAcq = new Array(5);
    for (let i = 1; i <= 5; i++) {
      initBalAcq[i] = await token.balanceOf(accounts[i].address);
    }
    const acquisitionFee = (100 * 10 ** decimal * _buyFeeAcquisition) / 100;
    await token
      .connect(accounts[7])
      .transfer(accounts[0].address, 100 * 10 ** decimal);
    const endBalZero = await token.balanceOf(accounts[0].address);
    const endBalAcq = new Array(5);
    for (let i = 1; i <= 5; i++) {
      endBalAcq[i] = await token.balanceOf(accounts[i]);
    }
    const transferZero = endBalZero - initBalZero;
    const transferAcq = new Array(5);
    for (let i = 1; i <= 5; i++) {
      transferAcq[i] = endBalAcq[i] - initBalAcq[i];
      expect(transferAcq[i]).to.equal(acquisitionFee / 5);
    }
    expect(transferZero).to.equal(
      ((100 * (100 - _buyFeeMarketing - _buyFeeAcquisition)) / 100) *
        10 ** decimal
    );
  });

  it("should transfer 1% of transaction to marketing wallet when selling token", async () => {
    const initBalZero = await token.balanceOf(accounts[0].address);
    const initBalMarketing = await token.balanceOf(accounts[1].address);
    const marketingFee = (100 * 10 ** decimal * _sellFeeMarketing) / 100;
    // Selling == Transferring to exchange addresses
    await token.transfer(accounts[7].address, 100 * 10 ** decimal);
    const endBalZero = await token.balanceOf(accounts[0].address);
    const endBalMarketing = await token.balanceOf(accounts[1].address);
    const transferZero = initBalZero - endBalZero;
    const transferMarketing = endBalMarketing - initBalMarketing;

    expect(transferZero).to.equal(100 * 10 ** decimal);
    expect(transferMarketing).to.equal(marketingFee);
  });

  it("should transfer 3% of transaction to acquisition wallets when selling token", async () => {
    // Selling == Transferring to exchange addresses
    const initBalZero = await token.balanceOf(accounts[0]);
    const initBalAcq = new Array(5);
    for (let i = 1; i <= 5; i++) {
      initBalAcq[i] = await token.balanceOf(accounts[i].address);
    }
    const acquisitionFee = (100 * 10 ** decimal * _sellFeeAcquisition) / 100;
    await token.transfer(accounts[7].address, 100 * 10 ** decimal);
    const endBalZero = await token.balanceOf(accounts[0].address);
    const endBalAcq = new Array(5);
    const transferAcq = new Array(5);
    const transferZero = initBalZero - endBalZero;
    for (let i = 1; i <= 5; i++) {
      endBalAcq[i] = await token.balanceOf(accounts[i]);
      transferAcq[i] = endBalAcq[i] - initBalAcq[i];
      expect(transferAcq[i]).to.equal(acquisitionFee / 5);
    }
    expect(transferZero).to.equal(100 * 10 ** decimal);
  });

  it("should transfer 1% of transaction to all holders wallet (reflection) when buying token", async () => {
    await token.setBuyFees(
      _buyFeeReflect,
      _buyFeeMarketing,
      _buyFeeAcquisition
    );
    await token.setSellFees(
      _sellFeeReflect,
      _sellFeeMarketing,
      _sellFeeAcquisition
    );
    const reflectFee = (100 * 10 ** decimal * _buyFeeReflect) / 100;
    const supply = await token.totalSupply();

    // Accounts[8] is normal account and should only have received reflections
    const initBalance = await token.balanceOf(accounts[8].address);

    // Buying == Transferring from exchange addresses
    await token
      .connect(accounts[7])
      .transfer(accounts[0].address, 100 * 10 ** decimal);

    const endBalance = await token.balanceOf(accounts[8].address);
    const transferBalance = endBalance - initBalance;

    expect(Math.abs(reflectFee * (endBalance / supply))).to.equal(
      transferBalance
    );
  });

  it("should transfer 5% of transaction to all holders wallets (reflection) when selling token", async () => {
    const reflectFee = (100 * 10 ** decimal * _sellFeeReflect) / 100;
    const supply = await token.totalSupply();

    // Accounts[8] is normal account and should only have receive reflections
    const initBalance = await token.balanceOf(accounts[8].address);

    // Buying == Transferring from exchange addresses
    await token.transfer(accounts[7].address, 100 * 10 ** decimal);

    const endBalance = await token.balanceOf(accounts[8].address);
    const transferBalance = endBalance - initBalance;

    expect(reflectFee * (endBalance / supply)).to.equal(transferBalance);
  });

  it("should not reflect tokens to excluded accounts", async () => {
    // Accounts[8] is normal account and should only have receive reflections
    const initBalance = await token.balanceOf(accounts[8].address);
    await token.excludeAccount(accounts[8].address);
    // Buying == Transferring from exchange addresses
    await token
      .connect(accounts[7])
      .transfer(accounts[0].address, 100 * 10 ** decimal);
    const endBalance = await token.balanceOf(accounts[8].address);
    const transferBalance = endBalance - initBalance;
    expect(transferBalance).to.equal(0);
  });

  it("should reimburse re-included accounts for any missed reflections", async () => {
    const buyReflectFee = (100 * 10 ** decimal * _buyFeeReflect) / 100;
    const supply = await token.totalSupply();
    const initBalance = await token.balanceOf(accounts[8].address);
    await token.includeAccount(accounts[8].address);
    const endBalance = await token.balanceOf(accounts[8].address);
    const transferBalance = endBalance - initBalance;
    const missedReflections = buyReflectFee * (endBalance / supply);
    expect(missedReflections).to.equal(transferBalance);
  });

  it("excluding and including accounts should not significant affect total supply", async () => {
    const initSupply = await token.totalSupply();
    await token.excludeAccount(accounts[0].address);
    await token.excludeAccount(accounts[1].address);
    await token.excludeAccount(accounts[7].address);
    // Selling == Transferring to exchange addresses
    await token.transfer(accounts[7].address, 10 * 10 ** decimal);
    let aSupply = 0;
    for (let i = 0; i <= 8; i++) {
      const e = await token.balanceOf(accounts[i].address);
      aSupply = aSupply + e * 1;
    }
    await token.includeAccount(accounts[0].address);
    await token.includeAccount(accounts[1].address);
    await token.includeAccount(accounts[7].address);
    let bSupply = 0;
    for (let i = 0; i <= 8; i++) {
      const e = await token.balanceOf(accounts[i].address);
      bSupply = bSupply + e * 1;
    }
    expect(initSupply - aSupply).to.be.lessThan(100);
    expect(bSupply - aSupply).to.be.lessThan(100);
  });
});

describe("Additional admin features", () => {
  // Deployer: accounts[0]
  // AcquisitionWallets: accounts[1] - accounts[5]
  // MarketingWallet: accounts[6]
  before(async function () {
    const TokenFactory = await ethers.getContractFactory("FeeOnTransfer");
    accounts = await ethers.getSigners();
    const acqWallets = [
      accounts[1].address,
      accounts[2].address,
      accounts[3].address,
      accounts[4].address,
      accounts[5].address,
    ];
    token = await TokenFactory.deploy(10000, accounts[6].address, acqWallets);
  });

  it("should allow admin to set exchange account and calculate fees accordingly", async () => {
    const transferAmount = 50 * 10 ** decimal;
    const transferFees = (transferAmount * 9) / 100;
    const initBal = await token.balanceOf(accounts[7].address);
    await token.transfer(accounts[7].address, transferAmount);
    const endBal = await token.balanceOf(accounts[7].address);
    expect(endBal - initBal).to.equal(transferAmount);

    await token.setExchange(accounts[7].address);
    const initBal2 = await token.balanceOf(accounts[7].address);
    await token.transfer(accounts[7].address, transferAmount);
    const endBal2 = await token.balanceOf(accounts[7].address);
    expect(endBal2 - initBal2).to.equal(transferAmount - transferFees);
  });

  it("should allow admin to remove exchange account and calculate fees accordingly", async () => {
    const transferAmount = 50 * 10 ** decimal;
    await token.removeExchange(accounts[7].address);
    const initBal = await token.balanceOf(accounts[7].address);
    await token.transfer(accounts[7].address, transferAmount);
    const endBal = await token.balanceOf(accounts[7].address);
    expect(endBal - initBal).equal(transferAmount);
  });

  it("should allow admin to change marketing wallet", async () => {
    const oldMarketAddress = await token.getMarketingWallet();
    // initial market address == accounts[6]
    await token.changeMarketing(accounts[8].address);
    const newMarketAddress = await token.getMarketingWallet();
    expect(oldMarketAddress).to.notEqual(newMarketAddress);
    expect(newMarketAddress).to.equal(accounts[8].address);
  });

  it("should allow admin to change acquisition wallets", async () => {
    const oldAcqAddress = await token.getAcquisitionWallet(0);
    // initial acquisition[0] address == accounts[1]
    await token.changeAcquisition(0, accounts[8].address);
    const newAcqAddress = await token.getAcquisitionWallet(0);
    expect(oldAcqAddress).to.notEqual(newAcqAddress);
    expect(newAcqAddress).to.equal(accounts[8].address);
  });

  it("should allow admin to set total Buy fees between 0 and 99%", async () => {
    await token.setBuyFees(0, 0, 0);
    await token.setBuyFees(33, 33, 33);
    await expect(token.setBuyFees(33, 34, 34)).to.be.reverted;
    await expect(token.setBuyFees(100, 100, 100)).to.be.reverted;
  });

  it("should allow admin to set total Sell fees between 0 and 99%", async () => {
    await token.setSellFees(0, 0, 0);
    await token.setSellFees(33, 33, 33);
    await token.setSellFees(33, 34, 34);
    await expect(token.setSellFees(100, 100, 100)).to.be.reverted;
  });

  it("should allow admin to exclude account from receiving redistribution fees", async () => {
    const initStatus = await token.isExcluded(accounts[8].address);
    await token.excludeAccount(accounts[8].address);
    const endStatus = await token.isExcluded(accounts[8].address);
    await expect(!initStatus && endStatus).to.be.true;
  });

  it("should allow admin to re-include excluded account to receive prior and future redistribution fees", async () => {
    const initStatus = await token.isExcluded(accounts[8].address);
    await token.includeAccount(accounts[8].address);
    const endStatus = await token.isExcluded(accounts[8].address);
    await expect(initStatus && !endStatus).to.be.true;
  });
});
