//const Migrations = artifacts.require("Migrations");
const basicCoin = artifacts.require("basicCoin");

module.exports = function (deployer) {
  //deployer.deploy(Migrations);
  deployer.deploy(basicCoin, "Basic", "BSC", 1000);
};
