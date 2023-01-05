const ReflectToken = artifacts.require("ReflectToken");

module.exports = function (deployer, network, accounts) {
  // Wallets
  // Admin(Deployer) = Accounts[0]
  // Marketing = Accounts[1]
  // Acquisition[] = Accounts[2-6]
  let acquisitions = [accounts[2], accounts[3], accounts[4], accounts[5], accounts[6]];
  deployer.deploy(ReflectToken,'Aggregate','AGGRO',10033010013370, accounts[1], acquisitions);
};