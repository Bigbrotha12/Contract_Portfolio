const CoinFlipper = artifacts.require("CoinFlipper");
const TestCoordinator = artifacts.require("TestCoordinator");
const truffleAssert = require('truffle-assertions');

contract("Proxy", (accounts) => {

  it("is a transparent proxy", async () => {
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
});

