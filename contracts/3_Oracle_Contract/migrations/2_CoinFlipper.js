const CoinFlipper = artifacts.require("CoinFlipper");
const TestCoordinator = artifacts.require("TestCoordinator");

module.exports = async function (deployer) {
    
    await deployer.deploy(TestCoordinator);
    let testOracle = await TestCoordinator.deployed();

    //constructor(uint64 _subscriptionId, address _vrfCoordinator)
    await deployer.deploy(CoinFlipper, "1332", testOracle.address);
};
