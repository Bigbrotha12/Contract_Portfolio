const AirdropClaim = artifacts.require("AirdropClaim");
const AirdropToken = artifacts.require("AirdropToken");

module.exports = async function (deployer) {
  let merkleRoot = "0xba7a2ebc5cf8bfab40b8a0e1ad414aca3b29aa577f467c2facce598143f173e9";
  let deadline = 10 // Airdrop will be active for 10 blocks
  let tokenAddr;

  // Deploy airdrop token with 1,000 initial supply
  await deployer.deploy(AirdropToken, "AirCoin", "ARC", 1000);
  let token = await AirdropToken.deployed();
  tokenAddr = token.address;

  await deployer.deploy(AirdropClaim, merkleRoot, tokenAddr, deadline);
  
};
