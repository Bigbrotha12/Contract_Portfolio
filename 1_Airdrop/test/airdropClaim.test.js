const airdropClaim = artifacts.require("AirdropClaim");
const truffleAssert = require('truffle-assertions');
const { snapshot, time } = require('@openzeppelin/test-helpers');

contract("airdropClaim", (accounts) => {
  it("should initialize to correct parameters", async () => {
    const airdropInst = await airdropClaim.deployed();
    

    assert.equal(10000, 10000, "10000 wasn't in the first account");
  });

  it("should allow valid claim within deadline", async () => {

  });

  it("should forbid invalid claim within deadline", async () => {

  });

  it("should forbid valid claim after deadline", async () => {

  });

  it("should only allow owner to withdraw unclaim tokens after deadline", async () => {

  });

  it("should not allow owner to withdraw unclaim tokens before deadline", async () => {

  });
  
});
