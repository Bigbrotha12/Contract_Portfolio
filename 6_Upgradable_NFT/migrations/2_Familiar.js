const FamiliarAdmin = artifacts.require("FamiliarAdmin");
const FamiliarIMX = artifacts.require("FamiliarIMX");
const FamiliarLogic = artifacts.require("FamiliarLogic");
const FamiliarProxy = artifacts.require("FamiliarProxy");

module.exports = async function (deployer, network, accounts) {

  // Admin = accounts[0], IMX = accounts[1]

  await deployer.deploy(FamiliarAdmin);
  await deployer.deploy(FamiliarIMX); 
  await deployer.deploy(FamiliarLogic);
  let routeConfig = [
    accounts[0],
    (await FamiliarAdmin.deployed()).address,
    accounts[1],
    (await FamiliarIMX.deployed()).address,
    (await FamiliarLogic.deployed()).address
  ]
  // constructor(address[] memory _routingConfig) 
  // Layout: [0] = admin, [1] = admin contract
  //         [2] = imx,   [3] = imx contract
  //         [4] = logic contract
  await deployer.deploy(FamiliarProxy, routeConfig);

};
