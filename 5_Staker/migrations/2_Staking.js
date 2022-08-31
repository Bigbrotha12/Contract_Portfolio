const Staking = artifacts.require("Staking");
const StakeToken = artifacts.require("StakeToken");
const RewardToken = artifacts.require("RewardToken");


module.exports = async function (deployer) {

    //constructor(string memory name_, string memory symbol_, uint256 supply_)
    await deployer.deploy(StakeToken, "StkCoin", "STK", web3.utils.toWei("1000"));
    await deployer.deploy(RewardToken, "RwdCoin", "RWD", web3.utils.toWei("1000"));

    let sToken = await StakeToken.deployed();
    let rToken = await RewardToken.deployed();
    await deployer.deploy(Staking, rToken.address, sToken.address);
};
