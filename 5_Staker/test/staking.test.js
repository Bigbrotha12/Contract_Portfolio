const { expect } = require("chai");
const testHelper = require("@openzeppelin/test-helpers");

let accounts, staker, tokenReward, tokenStake;

describe("Unit Test: Constructor", () => {
  before(async () => {
    const TokenFactory = await ethers.getContractFactory("StakeToken");
    const StakerFactory = await ethers.getContractFactory("Staking");
    tokenReward = await TokenFactory.deploy(
      "RewardT",
      "RWT",
      ethers.utils.parseUnits("1000", "ether")
    );
    tokenStake = await TokenFactory.deploy(
      "StakeT",
      "STT",
      ethers.utils.parseUnits("1000", "ether")
    );
    staker = await StakerFactory.deploy(
      tokenReward.address,
      tokenStake.address
    );
  });

  it("should create contract with staking token and reward token address", async () => {
    const stakeTokenAddress = await staker._stakeToken();
    const rewardTokenAddress = await staker._rewardsToken();
    expect(stakeTokenAddress).to.equal(tokenStake.address);
    expect(rewardTokenAddress).to.equal(tokenReward.address);
  });
});

describe("Unit Test: Views Functions", () => {
  let initSnap;
  const parse = (n) => ethers.utils.parseUnits(n, "ether");
  const mine = async (blocks) => {
    while (blocks--) {
      await ethers.provider.send("evm_mine");
    }
  };
  before(async () => {
    accounts = await ethers.getSigners();
    const TokenFactory = await ethers.getContractFactory("StakeToken");
    const StakerFactory = await ethers.getContractFactory("Staking");
    tokenReward = await TokenFactory.deploy(
      "RewardT",
      "RWT",
      ethers.utils.parseUnits("1000", "ether")
    );
    tokenStake = await TokenFactory.deploy(
      "StakeT",
      "STT",
      ethers.utils.parseUnits("1000", "ether")
    );
    staker = await StakerFactory.deploy(
      tokenReward.address,
      tokenStake.address
    );
    initSnap = await testHelper.snapshot();
  });
  afterEach(async () => {
    initSnap.restore();
  });

  it("should display correct total stake token supply", async () => {
    // Approve deposit of stake tokens to the describe
    await tokenStake.approve(staker.address, parse("100"));
    await staker.stake(parse("100"));

    const supply = await staker.totalSupply();
    const actualSupply = await tokenStake.balanceOf(staker.address);

    expect(supply).to.equal(actualSupply);
    expect(supply).to.equal(parse("100"));
  });

  it("should display user stake token balance", async () => {
    await tokenStake.approve(staker.address, parse("100"));
    await staker.stake(parse("100"));
    // This step we give account 1 50 tokens and deposit them in describe.
    // Expected balances: Account 0 == 100; Account 1 == 50; Total Supply == 150
    await tokenStake.transfer(accounts[1].address, parse("50"));
    await tokenStake.connect(accounts[1]).approve(staker.address, parse("50"));
    await staker.connect(accounts[1]).stake(parse("50"));

    const balanceAct0 = await staker.balanceOf(accounts[0].address);
    const balanceAct1 = await staker.balanceOf(accounts[1].address);
    const supply = await staker.totalSupply();

    expect(balanceAct0).to.equal(parse("100"));
    expect(balanceAct1).to.equal(parse("50"));
    expect(supply).to.equal(parse("150"));
  });

  it("should calculate and display the total rewards earned by user", async () => {
    await tokenReward.approve(staker.address, parse("100"));
    await staker.addFunding(parse("100"));

    // Deposit 50 stake tokens from account 0 and 100 tokens from account 1.
    await tokenStake.transfer(accounts[1].address, parse("100"));
    await tokenStake.approve(staker.address, parse("50"));
    await tokenStake.connect(accounts[1]).approve(staker.address, parse("100"));
    await staker.stake(parse("50"));
    await staker.connect(accounts[1]).stake(parse("100"));

    // Activate reward program for 10 blocks and 100 reward tokens.
    await staker.activateReward(parse("100"), 10);
    // Account 0 holds 50 / 150 = 33% of the supply.
    // Account 1 holds 100 / 150 = 66% of the supply.
    // After 5 blocks, account 0 should have 50 * 33% = 16 and account 1 should have 33
    // After 10 blocks, account 0 should have 33 and account 1 should have 66
    // NOTE: Rounding will occur, hence we check delta below minimum threshold.
    await mine(5);
    const account0Reward = await staker.earned(accounts[0].address);
    const account1Reward = await staker.earned(accounts[1].address);
    const expect0Reward = parse((50 * (50 / 150)).toString());
    const expect1Reward = parse((50 * (100 / 150)).toString());
    expect(
      parseInt((account0Reward - expect0Reward).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    expect(
      parseInt((account1Reward - expect1Reward).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));

    await mine(5);
    const account0Reward2 = await staker.earned(accounts[0].address);
    const account1Reward2 = await staker.earned(accounts[1].address);
    const expect0Reward2 = parse((100 * (50 / 150)).toString());
    const expect1Reward2 = parse((100 * (100 / 150)).toString());
    expect(
      parseInt((account0Reward2 - expect0Reward2).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    expect(
      parseInt((account1Reward2 - expect1Reward2).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
  });
});

describe("Unit Test: Mutative Functions", () => {
  let initSnap;
  const parse = (n) => ethers.utils.parseUnits(n, "ether");
  const mine = async (blocks) => {
    while (blocks--) {
      await ethers.provider.send("evm_mine");
    }
  };
  before(async () => {
    accounts = await ethers.getSigners();
    const TokenFactory = await ethers.getContractFactory("StakeToken");
    const StakerFactory = await ethers.getContractFactory("Staking");
    tokenReward = await TokenFactory.deploy(
      "RewardT",
      "RWT",
      ethers.utils.parseUnits("1000", "ether")
    );
    tokenStake = await TokenFactory.deploy(
      "StakeT",
      "STT",
      ethers.utils.parseUnits("1000", "ether")
    );
    staker = await StakerFactory.deploy(
      tokenReward.address,
      tokenStake.address
    );
    initSnap = await testHelper.snapshot();
  });
  afterEach(async () => {
    initSnap.restore();
  });

  it("should allow users to deposit stake tokens for incentive program", async () => {
    await tokenStake.approve(staker.address, parse("100"));
    await staker.stake(parse("10"));

    let balance = await staker.balanceOf(accounts[0].address);
    let actualBalance = await tokenStake.balanceOf(staker.address);
    let supply = await staker.totalSupply();
    expect(balance).to.equal(parse("10"));
    expect(supply).to.equal(parse("10"));
    expect(supply).to.equal(actualBalance);

    await staker.stake(parse("90"));
    balance = await staker.balanceOf(accounts[0].address);
    actualBalance = await tokenStake.balanceOf(staker.address);
    supply = await staker.totalSupply();
    expect(balance).equal(parse("100"));
    expect(supply).to.equal(parse("100"));
    expect(supply).to.equal(actualBalance);
  });

  it("should allow users to withdraw reward and stake tokens from incentive program", async () => {
    // Activate rewards program for 100 tokens and 20 seconds
    await tokenReward.approve(staker.address, parse("100"));
    await staker.addFunding(parse("100"));

    // Deposit 100 stake tokens from account 1
    await tokenStake.transfer(accounts[1].address, parse("100"));
    await tokenStake.connect(accounts[1]).approve(staker.address, parse("100"));
    await staker.connect(accounts[1]).stake(parse("100"));
    await staker.activateReward(parse("100"), 20);

    // Wait for half program duration so rewards earned should be 100 / 2 = 50
    // NOTE: Withdraw transaction will increase block number by 1 itself.
    await mine(10 - 1);

    const rInitBalance = await tokenReward.balanceOf(accounts[1].address);
    const sInitBalance = await tokenStake.balanceOf(accounts[1].address);
    await staker.connect(accounts[1]).withdraw(parse("100"));
    const rEndBalance = await tokenReward.balanceOf(accounts[1].address);
    const sEndBalance = await tokenStake.balanceOf(accounts[1].address);
    const rDelta = (rEndBalance - rInitBalance).toString();
    const sDelta = (sEndBalance - sInitBalance).toString();
    expect(rDelta).to.equal(parse("50").toString());
    expect(sDelta).to.equal(parse("100").toString());

    // Contract state check
    const balance = await staker.balanceOf(accounts[1].address);
    const supply = await staker.totalSupply();
    expect(balance).to.equal(parse("0"));
    expect(supply).to.equal(parse("0"));
  });

  it("should update users reward balance from incentive program", async () => {
    // Activate rewards program for 100 tokens and 20 seconds
    await tokenReward.approve(staker.address, parse("100"));
    await staker.addFunding(parse("100"));

    // Deposit 100 stake tokens from account 1
    await tokenStake.transfer(accounts[1].address, parse("100"));
    await tokenStake.connect(accounts[1]).approve(staker.address, parse("100"));
    await staker.connect(accounts[1]).stake(parse("100"));

    await staker.activateReward(parse("100"), 20);
    // Wait for half program duration so rewards earned should be 100 / 2 = 50
    // NOTE: Withdraw transaction will increase block number by 1 itself.
    await mine(10 - 1);

    let rInitBalance = await tokenReward.balanceOf(accounts[1].address);
    await staker.connect(accounts[1]).withdraw(parse("0"));
    let rEndBalance = await tokenReward.balanceOf(accounts[1].address);
    let rDelta = (rEndBalance - rInitBalance).toString();
    expect(rDelta).to.equal(parse("50").toString(), "First reward error");

    // Wait for second-half program duration so rewards earned should be 100 / 2 = 50 again
    await mine(10 - 1);

    rInitBalance = await tokenReward.balanceOf(accounts[1].address);
    const sInitBalance = await tokenStake.balanceOf(accounts[1].address);
    await staker.connect(accounts[1]).withdraw(parse("100"));
    rEndBalance = await tokenReward.balanceOf(accounts[1].address);
    const sEndBalance = await tokenStake.balanceOf(accounts[1].address);
    rDelta = (rEndBalance - rInitBalance).toString();
    const sDelta = (sEndBalance - sInitBalance).toString();
    expect(rDelta).to.equal(parse("50").toString(), "Second reward error");
    expect(sDelta).equal(parse("100").toString(), "Stake withdraw error");
  });
});

describe("Unit Test: Restricted Functions", () => {
  let initSnap;
  const parse = (n) => ethers.utils.parseUnits(n, "ether");
  before(async () => {
    accounts = await ethers.getSigners();
    const TokenFactory = await ethers.getContractFactory("StakeToken");
    const StakerFactory = await ethers.getContractFactory("Staking");
    tokenReward = await TokenFactory.deploy(
      "RewardT",
      "RWT",
      ethers.utils.parseUnits("1000", "ether")
    );
    tokenStake = await TokenFactory.deploy(
      "StakeT",
      "STT",
      ethers.utils.parseUnits("1000", "ether")
    );
    staker = await StakerFactory.deploy(
      tokenReward.address,
      tokenStake.address
    );
    initSnap = await testHelper.snapshot();
  });
  afterEach(async () => {
    initSnap.restore();
  });

  it("should allow admin to initiate incentive program", async () => {
    // Before rewards program activation, '_periodFinish', '_rewardRate', '_rewardsDuration' should be 0.
    let blockEnd = await staker._endBlock();
    let rewardRate = await staker._blockReward();
    let rewardDuration = await staker._rewardsDuration();
    expect(blockEnd).to.equal(parse("0"));
    expect(rewardRate).to.equal(parse("0"));
    expect(rewardDuration).to.equal(parse("0"));

    // Activate rewards program for 50 tokens and 10 seconds
    await tokenReward.approve(staker.address, parse("50"));
    await staker.addFunding(parse("50"));
    await staker.activateReward(parse("50"), 10);

    // After rewards program activation,
    // '_endBlock' == block.number + 10;
    // '_rewardRate' == 50 / 10 = 5
    // '_rewardsDuration' == 10
    const currentBlock = await ethers.provider.getBlockNumber();
    blockEnd = await staker._endBlock();
    rewardRate = await staker._blockReward();
    rewardDuration = await staker._rewardsDuration();
    expect(blockEnd).to.equal(currentBlock + 10);
    expect(rewardRate).to.equal(parse("5"));
    expect(rewardDuration).to.equal(10);
  });

  it("should not allow admin to initiate more than one incentive program at a time", async () => {
    // Activate rewards program for 50 tokens and 10 seconds
    await tokenReward.approve(staker.address, parse("100"));
    await staker.addFunding(parse("100"));
    await staker.activateReward(parse("50"), 10);

    await expect(staker.activateReward(parse("50"), 15)).to.be.reverted;
  });
});

describe("Integration Test: Staking Reward Calculation", () => {
  let initSnap;
  const parse = (n) => ethers.utils.parseUnits(n, "ether");
  const mine = async (blocks) => {
    while (blocks--) {
      await ethers.provider.send("evm_mine");
    }
  };
  before(async () => {
    accounts = await ethers.getSigners();
    const TokenFactory = await ethers.getContractFactory("StakeToken");
    const StakerFactory = await ethers.getContractFactory("Staking");
    tokenReward = await TokenFactory.deploy(
      "RewardT",
      "RWT",
      ethers.utils.parseUnits("1000", "ether")
    );
    tokenStake = await TokenFactory.deploy(
      "StakeT",
      "STT",
      ethers.utils.parseUnits("1000", "ether")
    );
    staker = await StakerFactory.deploy(
      tokenReward.address,
      tokenStake.address
    );
    initSnap = await testHelper.snapshot();
  });
  afterEach(async () => {
    initSnap.restore();
  });

  it("should allocate users reward according to their proportion of stake token pool", async () => {
    // Two users will deposit stake tokens such that one will hold 20% of supply and the other 80%
    await tokenStake.transfer(accounts[1].address, parse("20"));
    await tokenStake.transfer(accounts[2].address, parse("80"));

    await tokenStake.connect(accounts[1]).approve(staker.address, parse("20"));
    await tokenStake.connect(accounts[2]).approve(staker.address, parse("80"));
    await staker.connect(accounts[1]).stake(parse("20"));
    await staker.connect(accounts[2]).stake(parse("80"));

    // Active reward programs at 100 tokens for 10 seconds.
    // At time 0: User 1: 20% R = 0, User 2: 80% R = 0
    // At time 5: User 1: 20% R = 10, User 2: 80% R = 40
    // User 2 reduce stake to 50% and withdraw all reward
    // At time 10: User 1: 50% R = 32, User 2: 50% R = 20
    await tokenReward.approve(staker.address, parse("100"));
    await staker.addFunding(parse("100"));
    await staker.activateReward(parse("100"), 10);

    await mine(5); // time 5
    let user1Reward = await staker.earned(accounts[1].address);
    let user2Reward = await staker.earned(accounts[2].address);
    expect(user1Reward).to.equal(parse("10"));
    expect(user2Reward).to.equal(parse("40"));
    // NOTE: Withdraw function call will mine 1 block and earn block reward:
    // User 1 += 2; User 2 += 8 tokens.
    await staker.connect(accounts[2]).withdraw(parse("60"));

    await mine(5 - 1); // time 10
    user1Reward = await staker.earned(accounts[1].address);
    user2Reward = await staker.earned(accounts[2].address);
    expect(user1Reward).to.equal(parse("32"));
    expect(user2Reward).to.equal(parse("20"));
  });

  it("should allow user to stake additional stake tokens and allocate reward accordingly", async () => {
    let reward1, reward2, expectReward1, expectReward2;
    // Two users will deposit stake tokens such that one will hold 20% of supply and the other 80%
    await tokenStake.transfer(accounts[1].address, parse("40"));
    await tokenStake.transfer(accounts[2].address, parse("160"));

    await tokenStake.connect(accounts[1]).approve(staker.address, parse("40"));
    await tokenStake.connect(accounts[2]).approve(staker.address, parse("160"));
    await staker.connect(accounts[1]).stake(parse("20"));
    await staker.connect(accounts[2]).stake(parse("80"));

    // Active reward programs at 100 tokens for 20 seconds.
    // Rate = 5 tokens per block
    // At time 0: User 1: 20% R = 0, User 2: 80% R = 0
    await tokenReward.approve(staker.address, parse("100"));
    await staker.addFunding(parse("100"));
    await staker.activateReward(parse("100"), 20);
    const rate = 100 / 20;

    // At time 5: User 1: 20% R = 5, User 2: 80% R = 20
    // User 1 increase stake by 20 tokens
    await mine(5);
    reward1 = await staker.earned(accounts[1].address);
    reward2 = await staker.earned(accounts[2].address);
    expectReward1 = rate * (20 / 100) * 5;
    expectReward2 = rate * (80 / 100) * 5;
    expect(
      parseInt((reward1 - parse(expectReward1.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    expect(
      parseInt((reward2 - parse(expectReward2.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    // NOTE: Function call will mine 1 block and earn block reward:
    // User 1 += 1, User 2 += 4
    await staker.connect(accounts[1]).stake(parse("20"));
    expectReward1 += rate * (20 / 100) * 1;
    expectReward2 += rate * (80 / 100) * 1;

    // At time 10: User 1: 33% R = 6 + 6.6 = 12.6, User 2: 66% R = 24 + 13.2 = 37.2
    // User 2 increase stake by 20 tokens
    await mine(5 - 1);
    reward1 = await staker.earned(accounts[1].address);
    reward2 = await staker.earned(accounts[2].address);
    expectReward1 += rate * (40 / 120) * 4;
    expectReward2 += rate * (80 / 120) * 4;
    expect(
      parseInt((reward1 - parse(expectReward1.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    expect(
      parseInt((reward2 - parse(expectReward2.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    // NOTE: Function call will mine 1 block and earn block reward:
    // User 1 += 1.65, User 2 += 3.30
    await staker.connect(accounts[2]).stake(parse("20"));
    expectReward1 += rate * (40 / 120) * 1;
    expectReward2 += rate * (80 / 120) * 1;

    // At time 15: User 1: 28% R = 13.65 + 5.6 = 19.25, User 2: 72% R = 40.3 + 14.4 = 54.7
    // User 2 increase stake by 60 tokens
    await mine(5 - 1);
    reward1 = await staker.earned(accounts[1].address);
    reward2 = await staker.earned(accounts[2].address);
    expectReward1 += rate * (40 / 140) * 4;
    expectReward2 += rate * (100 / 140) * 4;
    expect(
      parseInt((reward1 - parse(expectReward1.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    expect(
      parseInt((reward2 - parse(expectReward2.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    // NOTE: Function call will mine 1 block and earn block reward:
    // User 1 += 1.4, User 2 += 3.6
    await staker.connect(accounts[2]).stake(parse("60"));
    expectReward1 += rate * (40 / 140) * 1;
    expectReward2 += rate * (100 / 140) * 1;

    // At time 20: User 1: 20% R = 20.4 + 4, User 2: 80% R = 57.6 + 16
    await mine(5 - 1);
    reward1 = await staker.earned(accounts[1].address);
    reward2 = await staker.earned(accounts[2].address);
    expectReward1 += rate * (40 / 180) * 4;
    expectReward2 += rate * (160 / 180) * 4;
    expect(
      parseInt((reward1 - parse(expectReward1.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    expect(
      parseInt((reward2 - parse(expectReward2.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
  });

  it("should allocate users reward after second incentive program starts", async () => {
    await tokenStake.transfer(accounts[1].address, parse("80"));
    await tokenStake.transfer(accounts[2].address, parse("80"));

    // One users will deposit stake tokens
    await tokenStake.connect(accounts[2]).approve(staker.address, parse("80"));
    await staker.connect(accounts[2]).stake(parse("80"));

    // Active reward programs at 100 tokens for 10 seconds.
    // At time 10: User 1: 0% R = 0, User 2: 100% R = 100
    await tokenReward.approve(staker.address, parse("200"));
    await staker.addFunding(parse("200"));
    await staker.activateReward(parse("100"), 10);
    await mine(10);
    let user2Reward = await staker.earned(accounts[2].address);
    expect(user2Reward).to.be.equal(parse("100"));

    await tokenStake.connect(accounts[1]).approve(staker.address, parse("80"));
    await staker.connect(accounts[1]).stake(parse("80"));
    await staker.activateReward(parse("100"), 10);

    // At time 10 of second reward period, Account two should have 100 from first program
    // plus 50 from second program for a total of 150 tokens. Account 1 should have
    // remaining 50 tokens.
    await mine(10);
    const user1Reward = await staker.earned(accounts[1].address);
    user2Reward = await staker.earned(accounts[2].address);
    expect(user1Reward).to.be.equal(parse("50"));
    expect(user2Reward).to.be.equal(parse("150"));
  });

  it("should allow user to reduce stake tokens and allocate reward accordingly", async () => {
    let reward1, reward2, expectReward1, expectReward2;
    // Two users will deposit stake tokens such that one will hold 20% of supply and the other 80%
    await tokenStake.transfer(accounts[1].address, parse("40"));
    await tokenStake.transfer(accounts[2].address, parse("160"));

    await tokenStake.connect(accounts[1]).approve(staker.address, parse("40"));
    await tokenStake.connect(accounts[2]).approve(staker.address, parse("160"));
    await staker.connect(accounts[1]).stake(parse("40"));
    await staker.connect(accounts[2]).stake(parse("160"));

    // Active reward programs at 100 tokens for 20 seconds.
    // At time 0: User 1: 20% R = 0, User 2: 80% R = 0
    await tokenReward.approve(staker.address, parse("100"));
    await staker.addFunding(parse("100"));
    await staker.activateReward(parse("100"), 20);
    const rate = 100 / 20;

    // At time 5: User 1: 20% R = 5, User 2: 80% R = 20
    // User 1 decrease stake by 20 tokens
    await mine(5);
    reward1 = await staker.earned(accounts[1].address);
    reward2 = await staker.earned(accounts[2].address);
    expectReward1 = rate * (40 / 200) * 5;
    expectReward2 = rate * (160 / 200) * 5;
    expect(
      parseInt((reward1 - parse(expectReward1.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    expect(
      parseInt((reward2 - parse(expectReward2.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    // NOTE: Function call will mine 1 block and earn block reward
    await staker.connect(accounts[1]).withdraw(parse("20"));
    expectReward1 += rate * (40 / 200) * 1;
    expectReward2 += rate * (160 / 200) * 1;

    // At time 10: User 1: 11% R = 7, User 2: 89% R = 42
    // User 2 decrease stake by 20 tokens
    await mine(5 - 1);
    reward1 = await staker.earned(accounts[1].address);
    reward2 = await staker.earned(accounts[2].address);
    expectReward1 += rate * (20 / 180) * 4;
    expectReward2 += rate * (160 / 180) * 4;
    expect(
      parseInt((reward1 - parse(expectReward1.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    expect(
      parseInt((reward2 - parse(expectReward2.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    // NOTE: Function call will mine 1 block and earn block reward
    await staker.connect(accounts[2]).withdraw(parse("20"));
    expectReward1 += rate * (20 / 180) * 1;
    expectReward2 += rate * (160 / 180) * 1;

    // At time 15: User 1: 12% R = 10, User 2: 87% R = 64
    // User 2 decrease stake by 60 tokens
    await mine(5 - 1);
    reward1 = await staker.earned(accounts[1].address);
    reward2 = await staker.earned(accounts[2].address);
    expectReward1 += rate * (20 / 160) * 4;
    expectReward2 += rate * (140 / 160) * 4;
    expect(
      parseInt((reward1 - parse(expectReward1.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    expect(
      parseInt((reward2 - parse(expectReward2.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    // NOTE: Function call will mine 1 block and earn block reward
    await staker.connect(accounts[2]).withdraw(60);
    expectReward1 += rate * (20 / 160) * 1;
    expectReward2 += rate * (140 / 160) * 1;

    // At time 20: User 1: 20% R = 15, User 2: 80% R = 84
    await mine(5 - 1);
    reward1 = await staker.earned(accounts[1].address);
    reward2 = await staker.earned(accounts[2].address);
    expectReward1 += rate * (20 / 100) * 4;
    expectReward2 += rate * (80 / 100) * 4;
    expect(
      parseInt((reward1 - parse(expectReward1.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
    expect(
      parseInt((reward2 - parse(expectReward2.toString())).toString())
    ).to.be.lessThan(parseInt(parse("1").toString()));
  });
});
