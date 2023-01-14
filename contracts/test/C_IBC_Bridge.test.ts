import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre, { ethers } from 'hardhat';
import { DemoToken } from './../typechain-types/contracts/A_DemoToken/index';
import { IBC_Bridge } from './../typechain-types/contracts/C_IBC_Messenger/index';

describe("IBC_Bridge", function () {
  async function DeployFixture() {
    const [admin, user1, user2, user3] = await hre.ethers.getSigners();
    const name: string = "DemoToken";
    const symbol: string = "DEMO";
    const limit: number = 1000;
    const whitelist: Array<string> = [admin.address, user1.address];

    const bridgeName: string = "IBC_DEMO";
    const bridgeVersion: string = "0.0.1";
    const minter: string = admin.address;

    const token = await (await hre.ethers.getContractFactory("DemoToken")).deploy(name, symbol, whitelist, limit);
    const bridge = await (await hre.ethers.getContractFactory("IBC_Bridge")).deploy(bridgeName, bridgeVersion, minter, token.address);
    await token.changeMinter(bridge.address, true);

    const IBridge = bridge as IBC_Bridge;
    const IToken = token as DemoToken;
    return { IToken, IBridge, admin, user1, user2, user3 };
  };

  describe("Deployment", function () {
    it("Should be deployed with correct parameters.", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      expect(await IBridge.getName()).to.be.equal("IBC_DEMO");
      expect(await IBridge.getVersion()).to.be.equal("0.0.1");
      expect(await IBridge.getChainId()).to.be.equal(hre.network.config.chainId);
      expect(await IBridge.MINTER()).to.be.equal(admin.address);
    });

    it("should initialize to correct domain hash", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      
      let domainTypeHash = ethers.utils.solidityKeccak256(["string"],["EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"]);
      let domainNameHash = ethers.utils.solidityKeccak256(["string"], ["IBC_DEMO"]);
      let domainVersionHash = ethers.utils.solidityKeccak256(["string"], ["0.0.1"]); 
      let domainChainId = await IBridge.getChainId();
      let domainAddress = await IBridge.getAddress();     
      // abi.encode
      let encodedDomain = ethers.utils.AbiCoder.prototype.encode(
        ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
        [domainTypeHash, domainNameHash, domainVersionHash, domainChainId, domainAddress]);
      let domainHash = ethers.utils.solidityKeccak256(["bytes32"], [encodedDomain]);
      let currentDomain = await IBridge.getCurrentDomainHash();
      
      expect(domainHash).to.be.equal(currentDomain);
    });
  });

  describe("Struct Construction", function () {
    it("should build valid domain hashes", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
  
      let domainTypeHash = ethers.utils.solidityKeccak256(["string"], ["EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"]);
      let domainNameHash = ethers.utils.solidityKeccak256(["string"], ["Foreign Bridge"]);
      let domainVersionHash = ethers.utils.solidityKeccak256(["string"], ["1.1.0"]); 
      let domainChainId = 3;
      let domainAddress = user1.address;     
      // abi.encode
      let encodedDomain = ethers.utils.AbiCoder.prototype.encode(
        ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
        [domainTypeHash, domainNameHash, domainVersionHash, domainChainId, domainAddress]);
      let domainHash = ethers.utils.solidityKeccak256(["bytes32"], [encodedDomain]);
      let currentDomain = await IBridge.buildDomainHash(domainNameHash, domainVersionHash, domainChainId, domainAddress);
   
      expect(domainHash).to.be.equal(currentDomain);
    });
  
    it("should build valid struct hashes", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
  
      let structTypeHash = ethers.utils.solidityKeccak256(["string"], ["Transaction(address receiver,uint256 receivingChainId,uint256 amount, uint256 nonce)"]);
      let structReceiver = user1.address;
      let structChainId = 1337; 
      let structAmount = 100;
      let structNonce = 1;     
      // abi.encode
      let encodedStruct = ethers.utils.AbiCoder.prototype.encode(
        ['bytes32', 'address', 'uint256', 'uint256', 'uint256'],
        [structTypeHash, structReceiver, structChainId, structAmount, structNonce]);
      let structHash = ethers.utils.solidityKeccak256(["bytes32"], [encodedStruct]);
      let builtStruct = await IBridge.buildStructHash(structReceiver, structChainId, structAmount, structNonce);
   
      expect(structHash).to.be.equal(builtStruct);
    });
  
    it("should conform to TypedDataV4 message signing", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
  
      let domainChainId = await IBridge.getChainId();
      let domainAddress = await IBridge.getAddress(); 
      let structReceiver = admin.address;
      let structChainId = 1337;
      let structAmount = 100;
      let structNonce = 1;
      let builtStruct = await IBridge.buildStructHash(structReceiver, structChainId, structAmount, structNonce);
      //let msg = await bridgeInst.getTypedDataHash(builtStruct);
      let msg = prepareMsgHash(structReceiver, structChainId, structAmount, structNonce, domainAddress, domainChainId);
      let prefixMsg = await IBridge.getPrefixedDataHash(builtStruct);
      let signedMsg = await admin.signMessage(msg);
  
      //Check that contract struct hashing and prefixing works correctly
      let recoveredPKey = ethers.utils.verifyMessage(prefixMsg, signedMsg);
  
      expect(recoveredPKey).to.be.equal(admin.address);
    });
  });

  describe("Validation", function () {
    it("should execute valid mint requests", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      
  
      // Prepare 2 message hash for signing
      let domainChainId = await IBridge.getChainId();
      let domainAddress = await IBridge.getAddress(); 
      let msg = prepareMsgHash(user1.address, domainChainId, 10, 0, domainAddress, domainChainId);
      let signedMsg = admin.signMessage(msg);  // Returns signed message object
     
      // Relay mint request to bridge
      expect(await IToken.balanceOf(user1.address)).to.be.equal(0);
      let mintTx = await IBridge.dataReceive(user1.address, hre.network.config.chainId || 1, 10, signedMsg);
      await expect(IBridge.dataReceive(user1.address, hre.network.config.chainId || 1, 10, signedMsg)).to.emit(IBridge, "DataReceived");
      expect(await IToken.balanceOf(user1.address)).to.be.equal(10);
    });
  
    it("should execute valid burn requests", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
  
      await IToken.mintTo(user1.address, 100);
  
      // Register Chain ID "1" as receiving domain 
      await IBridge.registerDomain("Foreign_Bridge", "1.0.0", 1, user1.address);
  
    });
  });

  describe("Domain Registration", function () {
    it("Should reject requests to unregistered domains.", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // Attempt send transaction to unregistered domain
      await expect(await IBridge.dataSend(user1.address, 10, 777)).to.be.revertedWith("IBC_Bridge: Unregistered Domain");
    });

    it("Should reject registration requests for existing domains.", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);

      // Registration request for existing domains should be rejected
      await expect(IBridge.registerDomain("Foreign_Bridge", "1.0.0", 1, user1.address)).to.be.revertedWith("EIP712X: Domain already exist");
    });

    it("Should register new valid receiving domains if admin", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
  
      // Registration request from non-admin accounts should be rejected
      await expect(IBridge.registerDomain("Foreign_Bridge", "1.0.0", 777, user1.address)).to.be.revertedWith("Ownable: caller is not the owner");
      // Register new domain name: "Foreign_Bridge", version: 1.0.0, chain: 777, address: accounts[5]
      await IBridge.registerDomain("Foreign_Bridge", "1.0.0", 777, user1.address);
    });
  
    it("Should allow updates to existing receiver domains", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
  
      // Change request from non-admin accounts should be rejected
      await expect(IBridge.changeDomain("Foreign_Bridge", "1.0.0", 777, user1.address)).to.be.revertedWith("Ownable: caller is not the owner");
      // Change request to unregistered domains should be rejected
      await expect(IBridge.changeDomain("Foreign_Bridge", "1.0.0", 999, user1.address)).to.be.revertedWith("EIP712X: Domain does not exist");
      // Change request domain name: "Foreign_Bridge", version: 1.4.0, chain: 777, address: accounts[7]
      await expect(IBridge.changeDomain("Foreign_Bridge", "1.4.0", 777, user1.address)).to.emit(IBridge, "Domain changed");
    });
  });
});

function prepareMsgHash(_recipient, _chainId, _amount, _nonce, _domainAddress, _domainChain) {

  // Reference encoding layout
  //    domainSeparator: keccak256(abi.encode(typeHash,name,version,chainId,receivingContract)
  //    buildStructHash: keccak256(abi.encode(typeHash,receiver,receivingChainId,tokenId,nonce))
  //    TypedMsg: keccak256(abi.encodePacked("\x19\x01", domainSeparator, buildStructHash))

  // domainSeparator
  let domainTypeHash = ethers.utils.solidityKeccak256(["string"], ["EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"]);
  let domainNameHash = ethers.utils.solidityKeccak256(["string"], ["Test"]);
  let domainVersionHash = ethers.utils.solidityKeccak256(["string"], ["1.0.0"]); 
  let domainChainId = _domainChain;
  let domainAddress = _domainAddress;     
  let encodedDomain = ethers.utils.AbiCoder.prototype.encode(
    ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
    [domainTypeHash, domainNameHash, domainVersionHash, domainChainId, domainAddress]);
  let domainHash = ethers.utils.solidityKeccak256(["bytes32"], [encodedDomain]);

  // buildStructHash
  let structTypeHash = ethers.utils.solidityKeccak256(["string"], ["Transaction(address receiver,uint256 receivingChainId,uint256 tokenId, uint256 nonce)"]);
  let structReceiver = _recipient;
  let structChainId = _chainId; 
  let structAmount = _amount;
  let structNonce = _nonce;     
  let encodedStruct = ethers.utils.AbiCoder.prototype.encode(
    ['bytes32', 'address', 'uint256', 'uint256', 'uint256'],
    [structTypeHash, structReceiver, structChainId, structAmount, structNonce]);
  let structHash = ethers.utils.solidityKeccak256(["bytes32"], [encodedStruct]);

  let msg = ethers.utils.solidityKeccak256(["string", "bytes32", "bytes32"], ["\x19\x01", domainHash, structHash]);
  return msg;
}