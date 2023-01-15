import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre from 'hardhat';
import { FamiliarProxy } from '../typechain-types/contracts/F_Upgradable_NFT/NFTDemo.sol';
import { FamiliarLogic } from '../typechain-types/contracts/F_Upgradable_NFT/FamiliarLogic';

describe("Upgradable NFT", function () {
  async function DeployFixture() {
    const [admin, user1, user2, user3] = await hre.ethers.getSigners();

    const proxy = await (await hre.ethers.getContractFactory("NFTDemo")).deploy();
    const logic = await (await hre.ethers.getContractFactory("FamiliarLogic")).deploy();

    const IProxy = proxy as FamiliarProxy;
    const ILogic = logic as FamiliarLogic;
    return { IProxy, ILogic, admin, user1, user2, user3 };
  };

  describe("Deployment and Initialization", function () {
    it("initializes to correct routing configuration", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // Admin = accounts[0], IMX = accounts[1]
      // Storage Layout:
      // 0: IMX Address       || 1: blueprint || 2: names           || 3: symbols           || 4: rootURI
      // 5: owners            || 6: balances  || 7: tokenApprovals  || 8: operatorApprovals || 9: defaultRoyaltyInfo
      // 10: tokenRoyaltyInfo || 11: admin    || 12: initializing   || 13: initialized      || 14: callRouting
      // 15: version
      // let admin = web3.utils.toChecksumAddress(await web3.eth.getStorageAt(famProxy.address, 11));
      // let IMX = web3.utils.toChecksumAddress(await web3.eth.getStorageAt(famProxy.address, 0));
      // let adminRoute = await famProxy.getRouting(admin);
      // let IMXRoute = await famProxy.getRouting(IMX);
  
      // // Admin and IMX accounts initialization
      // assert.equal(admin, accounts[0], "Admin account not initialized correctly");
      // assert.equal(IMX, accounts[1], "IMX account not initialized correctly");
  
      // // Routing initialization
      // expectEvent(adminRoute, "currentRouting", { role: admin, target: famAdmin.address });
      // expectEvent(IMXRoute, "currentRouting", { role: IMX, target: famIMX.address });
    });

    it("checks for valid upgrade target and initializes", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // State variables to check:
      // version[famLogic.address]; names; symbols; rootURI;
      // Expected values:
      // version  = "1.0.0"
      // names    = "Arcane Familiars"
      // symbols  = "ARC"
      // rootURI  = "IPFS/sampleCID"
      // let initData = [
      //   web3.utils.utf8ToHex("1.0.0"),
      //   web3.utils.utf8ToHex("Arcane Familiars"),
      //   web3.utils.utf8ToHex("ARC"),
      //   web3.utils.utf8ToHex("IPFS/sampleCID"),
      // ]
  
      // let tx1 = await famProxy.upgradeInit(famLogic.address, initData, { from: accounts[0] });
      // expectEvent(tx1, "contractUpgraded", { version: _sha3("1.0.0"), target: famLogic.address });
    });
  
    it("initializes upgraded contract correctly", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // State variables to check:
      // version[famLogic.address]; names; symbols; rootURI;
      // Expected values:
      // version  = "1.0.0"
      // names    = "Arcane Familiars"
      // symbols  = "ARC"
      // rootURI  = "IPFS/sampleCID"
      // let tx1 = await famProxy.getVersion({ from: accounts[0] });
      // expectEvent(tx1, "currentVersion", { version: _sha3("1.0.0"), target: famLogic.address });
  
      // let names = await proxyLogic.name({ from: accounts[2] });
      // let symbols = await proxyLogic.symbol({ from: accounts[2] });
      // let rootURI = web3.utils.hexToUtf8(await web3.eth.getStorageAt(famProxy.address, 4));
  
      // assert.equal("Arcane Familiars", names, "Names not initialized correctly");
      // assert.equal("ARC", symbols, "Symbols not initialized correctly");
      // assert.equal("IPFS/sampleCID", rootURI.substring(0, 14), "RootURI not initialized correctly");
    });
  
    it("is a transparent proxy", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // // Admin (accounts[0]) can call admin and proxy contract functions
      // let tx1 = await famProxy.getVersion({ from: accounts[0] });
      // truffleAssert.eventEmitted(tx1, "currentVersion");
      // let tx2 = await proxyAdmin.deleteDefaultRoyalty({ from: accounts[0] });
      // truffleAssert.eventEmitted(tx2, "royaltyUpdated");
  
      // // Admin cannot call logic or IMX contract
      // truffleAssert.fails(proxyLogic.name({ from: accounts[0] }));
      // truffleAssert.fails(proxyIMX.name({ from: accounts[0] }));
  
      // // Users (accounts[2]) and IMX (accounts[1]) cannot call Admin or proxy functions
      // truffleAssert.fails(famProxy.getVersion({ from: accounts[1] }));
      // truffleAssert.fails(famProxy.getVersion({ from: accounts[2] }));
      // truffleAssert.fails(proxyAdmin.deleteDefaultRoyalty({ from: accounts[1] }));
      // truffleAssert.fails(proxyAdmin.deleteDefaultRoyalty({ from: accounts[2] }));
  
      // // Users and IMX can call their respective contracts
      // let tx3 = await proxyIMX.name({ from: accounts[1] });
      // let tx4 = await proxyLogic.name({ from: accounts[2] });
      // assert.equal("Arcane Familiars", tx3, "IMX routing error");
      // assert.equal("Arcane Familiars", tx4, "Users routing error");
    });
  });

  describe("Admin Management", function () {
    it("changes admin successfully", async () => {
    const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      
    // // Admin calls to changeAdmin(address _newAdmin) should succeed except when
    // // new admin address is address(0).
    // let tx1 = await famProxy.changeAdmin(accounts[5], { from: accounts[0] });
    // expectEvent(tx1, "adminChanged", { prevAdmin: accounts[0], newAdmin: accounts[5] });
    //   truffleAssert.fails(famProxy.changeAdmin(accounts[5], { from: accounts[0] }));
      
    // let tx2 = await famProxy.changeAdmin(accounts[0], { from: accounts[5] });
    // expectEvent(tx2, "adminChanged", { prevAdmin: accounts[5], newAdmin: accounts[0] });
    //   truffleAssert.fails(famProxy.changeAdmin(ZERO_ADDRESS, { from: accounts[0] }), "Proxy: Invalid admin address");
    });
  
    it("changes routing successfully", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // // Admin calls to changeRouting(address _role, address _target) should succeed except when
      // // new _role address is address(0) since this is default route which is maintained via upgradeInit.
      // let tx1 = await famProxy.changeRouting(accounts[1], famLogic.address, { from: accounts[0] });
      // expectEvent(tx1, "routingUpdated", { role: accounts[1], target: famLogic.address });
      // let tx2 = await famProxy.getRouting(accounts[1], { from: accounts[0] });
      // expectEvent(tx2, "currentRouting", { role: accounts[1], target: famLogic.address });
    
      // await famProxy.changeRouting(accounts[1], famIMX.address, { from: accounts[0] });
      // truffleAssert.fails(famProxy.changeRouting(ZERO_ADDRESS, famAdmin.address, { from: accounts[0] }), "Proxy: Improper route change");
    });  
  });
  
  describe("Metadata Correctness", function () {
    it("provides correct URL for NFT image", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // // NFT Minting
      // let blob = web3.utils.toHex("{0005}:{03350555}");
      // await proxyIMX.mintFor(accounts[0], 1, blob, {from: accounts[1]});
  
      // // URL must be "IPFS/sampleCID/Images/{blueprint.substring(0,4)}.png
      // // For blueprint 03350555, expected value is "IPFS/sampleCID/Images/0335.png"
      // let tx1 = await proxyLogic.tokenURI(5, {from: accounts[2]});
      // assert.equal(tx1, "IPFS/sampleCID/Images/0335.png", "Incorrect URL received");
    });
  });

});

  

