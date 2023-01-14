import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre from 'hardhat';

describe("Upgradable NFT", function () {
  let famAdmin, famIMX, famLogic, famProxy, proxyAdmin, proxyIMX, proxyLogic;
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  before(async () => {
    famAdmin = await FamiliarAdmin.deployed();
    famIMX = await FamiliarIMX.deployed();
    famLogic = await FamiliarLogic.deployed();
    famProxy = await FamiliarProxy.deployed();

    // Proxy abstractions
    proxyAdmin = await FamiliarAdmin.at(famProxy.address);
    proxyIMX = await FamiliarIMX.at(famProxy.address);
    proxyLogic = await FamiliarLogic.at(famProxy.address);
  });

  describe("Deployment and Initialization", function () {
    it("initializes to correct routing configuration", async () => {
      // Admin = accounts[0], IMX = accounts[1]
      // Storage Layout:
      // 0: IMX Address       || 1: blueprint || 2: names           || 3: symbols           || 4: rootURI
      // 5: owners            || 6: balances  || 7: tokenApprovals  || 8: operatorApprovals || 9: defaultRoyaltyInfo
      // 10: tokenRoyaltyInfo || 11: admin    || 12: initializing   || 13: initialized      || 14: callRouting
      // 15: version
      let admin = web3.utils.toChecksumAddress(await web3.eth.getStorageAt(famProxy.address, 11));
      let IMX = web3.utils.toChecksumAddress(await web3.eth.getStorageAt(famProxy.address, 0));
      let adminRoute = await famProxy.getRouting(admin);
      let IMXRoute = await famProxy.getRouting(IMX);
  
      // Admin and IMX accounts initialization
      assert.equal(admin, accounts[0], "Admin account not initialized correctly");
      assert.equal(IMX, accounts[1], "IMX account not initialized correctly");
  
      // Routing initialization
      expectEvent(adminRoute, "currentRouting", { role: admin, target: famAdmin.address });
      expectEvent(IMXRoute, "currentRouting", { role: IMX, target: famIMX.address });
    });

    it("checks for valid upgrade target and initializes", async () => {
      // State variables to check:
      // version[famLogic.address]; names; symbols; rootURI;
      // Expected values:
      // version  = "1.0.0"
      // names    = "Arcane Familiars"
      // symbols  = "ARC"
      // rootURI  = "IPFS/sampleCID"
      let initData = [
        web3.utils.utf8ToHex("1.0.0"),
        web3.utils.utf8ToHex("Arcane Familiars"),
        web3.utils.utf8ToHex("ARC"),
        web3.utils.utf8ToHex("IPFS/sampleCID"),
      ]
  
      let tx1 = await famProxy.upgradeInit(famLogic.address, initData, { from: accounts[0] });
      expectEvent(tx1, "contractUpgraded", { version: _sha3("1.0.0"), target: famLogic.address });
    });
  
    it("initializes upgraded contract correctly", async () => {
      // State variables to check:
      // version[famLogic.address]; names; symbols; rootURI;
      // Expected values:
      // version  = "1.0.0"
      // names    = "Arcane Familiars"
      // symbols  = "ARC"
      // rootURI  = "IPFS/sampleCID"
      let tx1 = await famProxy.getVersion({ from: accounts[0] });
      expectEvent(tx1, "currentVersion", { version: _sha3("1.0.0"), target: famLogic.address });
  
      let names = await proxyLogic.name({ from: accounts[2] });
      let symbols = await proxyLogic.symbol({ from: accounts[2] });
      let rootURI = web3.utils.hexToUtf8(await web3.eth.getStorageAt(famProxy.address, 4));
  
      assert.equal("Arcane Familiars", names, "Names not initialized correctly");
      assert.equal("ARC", symbols, "Symbols not initialized correctly");
      assert.equal("IPFS/sampleCID", rootURI.substring(0, 14), "RootURI not initialized correctly");
    });
  
    it("is a transparent proxy", async () => {
      // Admin (accounts[0]) can call admin and proxy contract functions
      let tx1 = await famProxy.getVersion({ from: accounts[0] });
      truffleAssert.eventEmitted(tx1, "currentVersion");
      let tx2 = await proxyAdmin.deleteDefaultRoyalty({ from: accounts[0] });
      truffleAssert.eventEmitted(tx2, "royaltyUpdated");
  
      // Admin cannot call logic or IMX contract
      truffleAssert.fails(proxyLogic.name({ from: accounts[0] }));
      truffleAssert.fails(proxyIMX.name({ from: accounts[0] }));
  
      // Users (accounts[2]) and IMX (accounts[1]) cannot call Admin or proxy functions
      truffleAssert.fails(famProxy.getVersion({ from: accounts[1] }));
      truffleAssert.fails(famProxy.getVersion({ from: accounts[2] }));
      truffleAssert.fails(proxyAdmin.deleteDefaultRoyalty({ from: accounts[1] }));
      truffleAssert.fails(proxyAdmin.deleteDefaultRoyalty({ from: accounts[2] }));
  
      // Users and IMX can call their respective contracts
      let tx3 = await proxyIMX.name({ from: accounts[1] });
      let tx4 = await proxyLogic.name({ from: accounts[2] });
      assert.equal("Arcane Familiars", tx3, "IMX routing error");
      assert.equal("Arcane Familiars", tx4, "Users routing error");
    });
  });

  describe("Admin Management", function () {
    it("changes admin successfully", async () => {
    // Admin calls to changeAdmin(address _newAdmin) should succeed except when
    // new admin address is address(0).
    let tx1 = await famProxy.changeAdmin(accounts[5], { from: accounts[0] });
    expectEvent(tx1, "adminChanged", { prevAdmin: accounts[0], newAdmin: accounts[5] });
      truffleAssert.fails(famProxy.changeAdmin(accounts[5], { from: accounts[0] }));
      
    let tx2 = await famProxy.changeAdmin(accounts[0], { from: accounts[5] });
    expectEvent(tx2, "adminChanged", { prevAdmin: accounts[5], newAdmin: accounts[0] });
      truffleAssert.fails(famProxy.changeAdmin(ZERO_ADDRESS, { from: accounts[0] }), "Proxy: Invalid admin address");
    });
  
    it("changes routing successfully", async () => {
      // Admin calls to changeRouting(address _role, address _target) should succeed except when
      // new _role address is address(0) since this is default route which is maintained via upgradeInit.
      let tx1 = await famProxy.changeRouting(accounts[1], famLogic.address, { from: accounts[0] });
      expectEvent(tx1, "routingUpdated", { role: accounts[1], target: famLogic.address });
      let tx2 = await famProxy.getRouting(accounts[1], { from: accounts[0] });
      expectEvent(tx2, "currentRouting", { role: accounts[1], target: famLogic.address });
    
      await famProxy.changeRouting(accounts[1], famIMX.address, { from: accounts[0] });
      truffleAssert.fails(famProxy.changeRouting(ZERO_ADDRESS, famAdmin.address, { from: accounts[0] }), "Proxy: Improper route change");
    });  
});

describe("NFT Admin", function () {
  let famAdmin, famIMX, famLogic, famProxy, proxyAdmin, proxyIMX, proxyLogic;
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  before( async () => {
    famAdmin = await FamiliarAdmin.deployed(); 
    famIMX = await FamiliarIMX.deployed();
    famLogic = await FamiliarLogic.deployed();
    famProxy = await FamiliarProxy.deployed();

    // Proxy abstractions
    proxyAdmin = await FamiliarAdmin.at(famProxy.address);
    proxyIMX = await FamiliarIMX.at(famProxy.address);
    proxyLogic = await FamiliarLogic.at(famProxy.address);

    // Initialize NFT contract
    let initData = [
      web3.utils.utf8ToHex("1.0.0"),
      web3.utils.utf8ToHex("Arcane Familiars"),
      web3.utils.utf8ToHex("ARC"),
      web3.utils.utf8ToHex("IPFS/sampleCID"),
    ]
    await famProxy.upgradeInit(famLogic.address, initData, {from: accounts[0]});
  });

  describe("Royalty Management", function () {
    it("allows changing royalty information", async () => {
      // Admin can change royalty information displayed by 
      // royaltyInfo(uint256 _tokenId, uint256 _salePrice)
      let tx1 = await proxyAdmin.setDefaultRoyalty(accounts[0], 500);
      expectEvent(tx1, "royaltyUpdated", { beneficiary: accounts[0], fee: "500", tokenId: "0" });
      let tx2 = await proxyAdmin.setTokenRoyalty(20, accounts[2], 200);
      expectEvent(tx2, "royaltyUpdated", { beneficiary: accounts[2], fee: "200", tokenId: "20" });
  
      let defaultRoyalty = await proxyLogic.royaltyInfo(0, 10000);
      let customRoyalty = await proxyLogic.royaltyInfo(20, 10000);
      assert.equal(defaultRoyalty['0'], accounts[0], "Default receiver incorrect");
      assert.equal(defaultRoyalty['1'].toString(), "500", "Default fee incorrect");
      assert.equal(customRoyalty['0'], accounts[2], "Custom receiver incorrect");
      assert.equal(customRoyalty['1'].toString(), "200", "Custom fee incorrect");
    });
  
    it("allows deleting royalty information", async () => {
      // Deleting royalty information set fees and beneficiary to 0
      let tx1 = await proxyAdmin.deleteDefaultRoyalty();
      expectEvent(tx1, "royaltyUpdated", { beneficiary: ZERO_ADDRESS, fee: "0", tokenId: "0" });
      let tx2 = await proxyAdmin.resetTokenRoyalty(20);
      expectEvent(tx2, "royaltyUpdated", { beneficiary: ZERO_ADDRESS, fee: "0", tokenId: "20" }); 
      
      let defaultRoyalty = await proxyLogic.royaltyInfo(0, 10000);
      let customRoyalty = await proxyLogic.royaltyInfo(20, 10000);
      assert.equal(defaultRoyalty['0'], ZERO_ADDRESS, "Default receiver incorrect");
      assert.equal(defaultRoyalty['1'].toString(), "0", "Default fee incorrect");
      assert.equal(customRoyalty['0'], ZERO_ADDRESS, "Custom receiver incorrect");
      assert.equal(customRoyalty['1'].toString(), "0", "Custom fee incorrect");
    });
  });
});

describe("NFT Implementation", function () {
  let famAdmin, famIMX, famLogic, famProxy, proxyAdmin, proxyIMX, proxyLogic;
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  before(async () => {
    famAdmin = await FamiliarAdmin.deployed();
    famIMX = await FamiliarIMX.deployed();
    famLogic = await FamiliarLogic.deployed();
    famProxy = await FamiliarProxy.deployed();

    // Proxy abstractions
    proxyAdmin = await FamiliarAdmin.at(famProxy.address);
    proxyIMX = await FamiliarIMX.at(famProxy.address);
    proxyLogic = await FamiliarLogic.at(famProxy.address);
  });

  it("prevents unauthorized inits", async () => {
    // Initialization can only be called once and only by admin
    let initData = [
      web3.utils.utf8ToHex("1.0.0"),
      web3.utils.utf8ToHex("Arcane Familiars"),
      web3.utils.utf8ToHex("ARC"),
      web3.utils.utf8ToHex("IPFS/sampleCID"),
    ]

    // Correct init by admin
    let tx1 = await famProxy.upgradeInit(famLogic.address, initData, { from: accounts[0] });
    expectEvent(tx1, "contractUpgraded");

    // Additional init attempts will fail
    truffleAssert.fails(famProxy.upgradeInit(famLogic.address, initData, { from: accounts[0] }), "Proxy: Contract already initialized");
    truffleAssert.fails(famProxy.upgradeInit(famLogic.address, initData, { from: accounts[2] }));
    truffleAssert.fails(proxyLogic.init(initData, { from: accounts[0] }));
    truffleAssert.fails(proxyLogic.init(initData, { from: accounts[2] }), "FamiliarLogic: Unauthorized initialization");
  });
  describe("Metadata Correctness", function () {
    it("provides correct URL for NFT image", async () => {
      // NFT Minting
      let blob = web3.utils.toHex("{0005}:{03350555}");
      await proxyIMX.mintFor(accounts[0], 1, blob, {from: accounts[1]});
  
      // URL must be "IPFS/sampleCID/Images/{blueprint.substring(0,4)}.png
      // For blueprint 03350555, expected value is "IPFS/sampleCID/Images/0335.png"
      let tx1 = await proxyLogic.tokenURI(5, {from: accounts[2]});
      assert.equal(tx1, "IPFS/sampleCID/Images/0335.png", "Incorrect URL received");
    });
  });
});

  
});
