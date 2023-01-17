import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre, { ethers } from 'hardhat';
import { NFTDemo } from '../typechain-types/contracts/F_Upgradable_NFT/NFTDemo.sol';
import { FamiliarLogic } from '../typechain-types/contracts/F_Upgradable_NFT';

describe("Upgradable NFT", function () {
  async function DeployFixture() {
    const [admin, user1, user2, user3] = await ethers.getSigners();
    const routingData = [admin.address];
    const proxy = await (await ethers.getContractFactory("NFTDemo")).deploy(routingData);
    const logic = await (await ethers.getContractFactory("FamiliarLogic")).deploy();
    await proxy.deployed();
    await logic.deployed();
    const IProxy = proxy as NFTDemo;
    
    // Initialization
    // [0]: Version | [1]: Name | [2]: Symbol | [3]: RootURI
    const version: string = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("1.0.0"));
    const name: string = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("NFT Demo"));
    const symbol: string = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("NFTD"));
    const rootURI: string = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("https://picsum.photos/"));
    const initData: Array<string> = [version, name, symbol, rootURI];
    await IProxy.upgradeInit(logic.address, initData);
    const ILogic = logic.attach(proxy.address) as FamiliarLogic;
    
    return { IProxy, ILogic, admin, user1, user2, user3 };
  };

  describe("Deployment and Initialization", function () {
    it("Should initialize to correct data and routing configuration", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      expect(await IProxy.callStatic.getRouting(user1.address)).to.be.equal(ethers.constants.AddressZero);
      expect(await IProxy.callStatic.getVersion()).to.be.equal("1.0.0");
      expect(await ILogic.connect(user1).name()).to.be.equal("NFT Demo");
      expect(await ILogic.connect(user1).symbol()).to.be.equal("NFTD");
    });
  
    it("Should be a transparent proxy", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      expect(IProxy.address).to.be.equal(ILogic.address);
      // Users may not call proxy contract functions
      await expect(IProxy.connect(user1).getVersion()).to.be.reverted;
      // Users may call logic functions
      await expect(ILogic.connect(user1).mint(user1.address, ethers.utils.hexlify(ethers.utils.toUtf8Bytes("TEST")))).not.to.be.reverted;

      // Admin may not call logic contract functions
      await expect(ILogic.mint(user1.address, ethers.utils.hexlify(ethers.utils.toUtf8Bytes("TEST")))).to.be.reverted;
      // Admin may call proxy functions
      await expect(IProxy.getVersion()).not.to.be.reverted;
    });
  });

  describe("Admin Management", function () {
    it("Should change admin successfully", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      
      // Address zero is not allowed target
      await expect(IProxy.changeAdmin(ethers.constants.AddressZero)).to.be.revertedWith("Proxy: Invalid admin address");
      // User 1 to be new admin
      await expect(IProxy.changeAdmin(user1.address)).to.emit(IProxy, "adminChanged").withArgs(
        admin.address,
        user1.address
      );
      await expect(IProxy.connect(user1).getVersion()).not.to.be.reverted;
    });
  
    it("Should change routing successfully", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // User 2 address as 'target' for user 1
      await expect(IProxy.changeRouting(user1.address, user2.address)).to.emit(IProxy, "routingUpdated").withArgs(
        user1.address,
        user2.address
      );

      // Check routing has indeed changed
      expect(await IProxy.callStatic.getRouting(user1.address)).to.be.equal(user2.address);
    });  
  });

  describe("Minting", function () {
    it("Should mint new tokens.", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      let pictureSize = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("200"));
      await expect(ILogic.connect(user1).mint(user1.address, pictureSize)).to.emit(ILogic, "Transfer").withArgs(
        ethers.constants.AddressZero,
        user1.address,
        0
      );
    });

    it("Should mint tokens uniquely and sequentially.", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      let pictureSize = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("200"));
      await expect(ILogic.connect(user1).mint(user1.address, pictureSize)).to.emit(ILogic, "Transfer").withArgs(
        ethers.constants.AddressZero,
        user1.address,
        0
      );
      await expect(ILogic.connect(user2).mint(user1.address, pictureSize)).to.emit(ILogic, "Transfer").withArgs(
        ethers.constants.AddressZero,
        user1.address,
        1
      );
      await expect(ILogic.connect(user2).mint(user2.address, pictureSize)).to.emit(ILogic, "Transfer").withArgs(
        ethers.constants.AddressZero,
        user2.address,
        2
      );
      expect(await ILogic.connect(user1).totalSupply()).to.be.equal(3);
    });

    it("Should track token ownership and balances.", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      let pictureSize = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("200"));
      await ILogic.connect(user1).mint(user1.address, pictureSize);
      await ILogic.connect(user2).mint(user1.address, pictureSize);
      await ILogic.connect(user2).mint(user2.address, pictureSize);

      expect(await ILogic.connect(user1).ownerOf(0)).to.be.equal(user1.address);
      expect(await ILogic.connect(user1).ownerOf(1)).to.be.equal(user1.address);
      expect(await ILogic.connect(user1).ownerOf(2)).to.be.equal(user2.address);

      expect(await ILogic.connect(user1).balanceOf(user1.address)).to.be.equal(2);
      expect(await ILogic.connect(user1).balanceOf(user2.address)).to.be.equal(1);
    });
  });
  
  describe("Metadata Correctness", function () {
    it("Should provide correct URL for NFT image", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // URL points to Lorem Picsum site for random images.
      // Blueprint will determine picture size.
      let pictureSize1 = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("200"));
      let pictureSize2 = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("400"))
      await ILogic.connect(user1).mint(user1.address, pictureSize1);
      await ILogic.connect(user1).mint(user1.address, pictureSize2);
  
      expect(await ILogic.connect(user1).tokenURI(0)).to.be.equal("https://picsum.photos/200"); 
      expect(await ILogic.connect(user1).tokenURI(1)).to.be.equal("https://picsum.photos/400"); 
    });

    it("Should provide correct blueprint for NFT", async () => {
      const { IProxy, ILogic, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      let pictureSize1 = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("200"));
      let pictureSize2 = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("400"))
      await ILogic.connect(user1).mint(user1.address, pictureSize1);
      await ILogic.connect(user1).mint(user1.address, pictureSize2);
  
      expect(await ILogic.connect(user1).getTokenBlueprint(0)).to.be.equal("200"); 
      expect(await ILogic.connect(user1).getTokenBlueprint(1)).to.be.equal("400"); 
    });
  });

  

});

  

