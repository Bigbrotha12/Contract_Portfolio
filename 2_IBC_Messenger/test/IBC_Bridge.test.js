const IBC_Bridge = artifacts.require("IBC_Bridge");
const TestNFT = artifacts.require("TestNFT");
const truffleAssert = require('truffle-assertions');
const expectEvent = require('@openzeppelin/test-helpers/src/expectEvent');

contract("IBC_Bridge", (accounts) => {

  it("should initialize to correct domain hash", async () => {
    let nftInst = await TestNFT.deployed();
    let bridgeInst = await IBC_Bridge.deployed();

    let domainTypeHash = web3.utils.soliditySha3("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    let domainNameHash = web3.utils.soliditySha3("Test");
    let domainVersionHash = web3.utils.soliditySha3("1.0.0"); 
    let domainChainId = await bridgeInst.getChainId();
    let domainAddress = await bridgeInst.getAddress();     
    // abi.encode
    let encodedDomain = web3.eth.abi.encodeParameters(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [domainTypeHash, domainNameHash, domainVersionHash, domainChainId, domainAddress]);
    let domainHash = web3.utils.soliditySha3(encodedDomain);
    let currentDomain = await bridgeInst.getCurrentDomainHash();
    
    assert.equal(domainHash, currentDomain, "Domain hash initialization error");
  });

  it("should build valid domain hashes", async () => {
  });

  it("should build valid struct hashes", async () => {
  });

  it("should conform to TypedDataV4 message signing", async () => {
  });

  it("should execute valid mint requests", async () => {
  });

  it("should execute valid burn requests", async () => {
  });

  it("should register new valid receive domains", async () => {
  });

  it("should change existing receiver domains", async () => {
  });
});
