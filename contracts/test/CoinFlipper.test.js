const CoinFlipper = artifacts.require("CoinFlipper");
const TestCoordinator = artifacts.require("TestCoordinator");
const truffleAssert = require('truffle-assertions');

contract("CoinFlipper", (accounts) => {

  it("should allow users to add funds to place bets", async () => {
    let flipperInst = await CoinFlipper.deployed();

    // Contract balances are 0
    await balanceChecker("0","0","0","0",accounts[1]);

    // Player 1 is accounts[1] deposits 1 ether
    let tx = await flipperInst.placeBet({from: accounts[1], value: web3.utils.toWei("1")});
    truffleAssert.eventEmitted(tx, "betPlaced");

    // Player 1 cannot deposit below 0.1 ether
    truffleAssert.fails(flipperInst.placeBet({from: accounts[1], value: web3.utils.toWei("10", "milli")}), "CoinFlipper: Minimum bet is 0.1 ETH");

    // Contract balances are 1 ether
    await balanceChecker("1000","1000","0","1000",accounts[1]);
  });

  it("should allow users to withdraw balances", async () => {
    let flipperInst = await CoinFlipper.deployed();

    // Player 1 has deposited 1 ether, they can withdraw 0.2 ether, and then remaining 0.8 ether
    let tx1 = await flipperInst.payOut(web3.utils.toWei("200", "milli"), {from: accounts[1]});
    truffleAssert.eventEmitted(tx1, "betPaidOut");
    assert.equal((await flipperInst.getPlayerBalance(accounts[1])).toString(), web3.utils.toWei("800", "milli"), "Player 1 balance incorrect");

    let tx2 = await flipperInst.payOut(web3.utils.toWei("800", "milli"), {from: accounts[1]});
    truffleAssert.eventEmitted(tx2, "betPaidOut");
    assert.equal((await flipperInst.getPlayerBalance(accounts[1])).toString(), "0", "Player 1 balance incorrect");

    // Should fail since player 1 has no balance remaining
    truffleAssert.fails(flipperInst.payOut(web3.utils.toWei("100", "milli"), {from: accounts[1]}), "CoinFlipper: Invalid withdraw amount");
  });

  it("should allow users to play in coin flipping game", async () => {
    let flipperInst = await CoinFlipper.deployed();
    let coordinatorInst = await TestCoordinator.deployed();

    // Fund contract
    await web3.eth.sendTransaction({from: accounts[0], to: flipperInst.address, value: web3.utils.toWei("5")});

    // Player 1 deposit ether to contract
    await flipperInst.placeBet({from: accounts[1], value: web3.utils.toWei("1")});

    // Game is started and oracle query made
    let tx = await flipperInst.startCoinFlip({from: accounts[1]});
    truffleAssert.eventEmitted(tx, "logNewQuery");

    // Resolve oracle query. Test queries will be deterministic 1 or 0 to test behavior
    // Test Oracle will always return queryId 500; in Production, this id will be unique to the request
    oracleTx = await coordinatorInst.answerTestQuery(500, 0, flipperInst.address);
    
    // Player 1 and contract balance is updated after a loss
    await balanceChecker("6000", "0", "6000", "0", accounts[1]);

    // Player 1 deposit ether to contract and plays again
    await flipperInst.placeBet({from: accounts[1], value: web3.utils.toWei("1")});
    let tx2 = await flipperInst.startCoinFlip({from: accounts[1]});
    truffleAssert.eventEmitted(tx2, "logNewQuery");

    // Player 1 and contract balance is updated after a win
    await coordinatorInst.answerTestQuery(500, 1, flipperInst.address);

    await balanceChecker("7000", "2000", "5000", "2000", accounts[1]); 
  });

  it("should allow admin to remove funds not claimable by users", async () => {
    let flipperInst = await CoinFlipper.deployed();

    // Currently contract has 7 ether, 2 belong to player and 5 free to remove
    // Admin should be able to remove 5 ether
    await flipperInst.removeBalance();
    await balanceChecker("2000", "2000", "0", "2000", accounts[1]);
    
    // Admin is not allow to withdraw remaining 2 ether so balance remaining same.
    await flipperInst.removeBalance();
    await balanceChecker("2000", "2000", "0", "2000", accounts[1]);

    // Only player can remove their balance
    let tx = await flipperInst.payOut(web3.utils.toWei("2"), {from: accounts[1]});
    truffleAssert.eventEmitted(tx, "betPaidOut");
  });

  it("should forbid players from add or removing funds while awaiting coin flip result", async () => {
    let flipperInst = await CoinFlipper.deployed();
    let coordinatorInst = await TestCoordinator.deployed();

    // Fund contract
    await web3.eth.sendTransaction({from: accounts[0], to: flipperInst.address, value: web3.utils.toWei("5")});

    // Player 1 deposit ether to contract
    await flipperInst.placeBet({from: accounts[1], value: web3.utils.toWei("1")});

    // Game is started and oracle query made
    let tx = await flipperInst.startCoinFlip({from: accounts[1]});
    truffleAssert.eventEmitted(tx, "logNewQuery");

    // Attempt to add to bet fails
    truffleAssert.fails(flipperInst.placeBet({from: accounts[1], value: web3.utils.toWei("1")}), "CoinFlipper: Coin flip in progress");

    // Attempt to withdraw bet fails
    truffleAssert.fails(flipperInst.payOut(web3.utils.toWei("1"),{from: accounts[1]}), "CoinFlipper: Coin flip in progress");

    // Attempt to generate new query fails
    truffleAssert.fails(flipperInst.startCoinFlip({from: accounts[1]}), "CoinFlipper: Coin flip in progress");

    // Only after outcome player can add, withdraw, or play again
    await coordinatorInst.answerTestQuery(500, 1, flipperInst.address);
    await flipperInst.placeBet({from: accounts[1], value: web3.utils.toWei("1")});
    await flipperInst.payOut(web3.utils.toWei("1"),{from: accounts[1]});
    await flipperInst.startCoinFlip({from: accounts[1]});
  });
});

async function balanceChecker(expectTotal, expectReserved, expectFree, expectPlayer, playerAddress) {
    let flipperInst = await CoinFlipper.deployed();
    totalBalance = await flipperInst.getBalance();
    reservedBalance = await flipperInst.getReservedBalance();
    freeBalance = await flipperInst.getFreeBalance();
    assert.equal(totalBalance.toString(), web3.utils.toWei(expectTotal, "milli").toString(), "Total Balance incorrect");
    assert.equal(reservedBalance.toString(), web3.utils.toWei(expectReserved, "milli").toString(), "Reserved Balance incorrect");
    assert.equal(freeBalance.toString(), web3.utils.toWei(expectFree, "milli").toString(), "Free Balance incorrect");
    assert.equal((await flipperInst.getPlayerBalance(playerAddress)).toString(), web3.utils.toWei(expectPlayer, "milli").toString(), "Player 1 has wrong balance");
}