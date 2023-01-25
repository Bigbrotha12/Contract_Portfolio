import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre, { ethers } from 'hardhat';
import { DemoToken } from './../typechain-types/contracts/A_DemoToken/index';
import { IBC_Bridge } from './../typechain-types/contracts/C_IBC_Messenger/IBC_Bridge';

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

    const token = await (await hre.ethers.getContractFactory("DemoToken")).deploy(name, symbol, whitelist);
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

    it("Should initialize to correct domain hash", async () => {
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
      let domainHash = ethers.utils.solidityKeccak256(["bytes"], [encodedDomain]);
      let currentDomain = await IBridge.getCurrentDomainHash();
      
      expect(domainHash).to.be.equal(currentDomain);
    });
  });

  describe("Struct Construction", function () {
    it("Should build valid domain hashes", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
  
      let domainTypeHash = ethers.utils.solidityKeccak256(["string"], ["EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"]);
      let domainNameHash = ethers.utils.solidityKeccak256(["string"], ["Foreign Bridge"]);
      let domainVersionHash = ethers.utils.solidityKeccak256(["string"], ["1.1.0"]); 
      let domainChainId = 3;
      let domainAddress = user1.address;     
      // abi.encode
      let encodedDomain = ethers.utils.defaultAbiCoder.encode(
        ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
        [domainTypeHash, domainNameHash, domainVersionHash, domainChainId, domainAddress]);
      let domainHash = ethers.utils.solidityKeccak256(["bytes"], [encodedDomain]);
      let currentDomain = await IBridge.buildDomainHash(domainNameHash, domainVersionHash, domainChainId, domainAddress);
   
      expect(domainHash).to.be.equal(currentDomain);
    });
  
    it("Should build valid struct hashes", async () => {
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
      let structHash = ethers.utils.solidityKeccak256(["bytes"], [encodedStruct]);
      let builtStruct = await IBridge.buildStructHash(structReceiver, structChainId, structAmount, structNonce);
   
      expect(structHash).to.be.equal(builtStruct);
    });
  
    it("Should conform to TypedDataV4 message signing", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
  
      let domainChainId = await IBridge.getChainId();
      let domainAddress = await IBridge.getAddress();     

      let domainCalc = domainHash("IBC_DEMO", "0.0.1", domainChainId.toNumber(), domainAddress);
      let structCalc = structHash(user1.address, domainChainId.toNumber(), 100, 0);
      
      let digest = prepareMsgHash(user1.address, domainChainId.toNumber(), 100, 0, "IBC_DEMO", "0.0.1", domainAddress);
      let solDigest = await IBridge.getPrefixedDataHash(structCalc);
      
      let signature = await admin.signMessage(digest);
      let recoveredPKey = ethers.utils.verifyMessage(solDigest, signature);
  
      expect(recoveredPKey).to.be.equal(admin.address);
    });
  });

  describe("Validation", function () {
    it("Should execute valid mint requests", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const mintAmount = 100;
      const domainName: string = await IBridge.getName();
      const domainVersion: string = await IBridge.getVersion();
      const domainChainId: number = (await IBridge.getChainId()).toNumber();
      const domainAddress: string = await IBridge.getAddress();
      const currentNonce: number = (await IBridge.nonce(user1.address, domainChainId, domainChainId)).toNumber();
    
      let msgHash = prepareMsgHash(user1.address, domainChainId, mintAmount, currentNonce, domainName, domainVersion, domainAddress);
      let signature = await admin.signMessage(ethers.utils.arrayify(msgHash));

      await expect(IBridge.dataReceive(user1.address, domainChainId, mintAmount, signature)).to.changeTokenBalance(
        IToken,
        user1.address,
        mintAmount
      );
    });
  
    it.only("should execute valid burn requests", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const transferAmount = 100;
      const newDomainName: string = "Foreign_Bridge";
      const newDomainVersion: string = "1.0.0";
      const newDomainId: number = 1;
      const newDomainAddress: string = user3.address;

      // register new destination domain
      await IBridge.registerDomain(newDomainName, newDomainVersion, newDomainId, newDomainAddress);
      await IToken.mintTo(user1.address, transferAmount);
      
      let filter = IBridge.filters.DataSent(user1.address);
      let hash = await IBridge.connect(user1).dataSend(user1.address, transferAmount, newDomainId);
      let receipt = await ethers.provider.getTransactionReceipt(hash.hash);
      let blockEvent = await IBridge.queryFilter(filter, receipt.blockHash);
      if (blockEvent) {
        let result = blockEvent.pop()?.args;
        if (result)
        {
          let receiver = result[0];
          let amount = result[1];
          let destChain = result[2];
          let nonce = result[3];
          console.log("Receiver: %s, amount: %d, destination: %d, nonce: %d", receiver, amount, destChain, nonce);
        }
        

      }
      
    });
  });

  describe("Domain Registration", function () {
    it("Should reject requests to unregistered domains.", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const transferAmount = 100;
      const newDomainId = 777;
      // Attempt send transaction to unregistered domain
      await expect(IBridge.dataSend(user1.address, transferAmount, newDomainId)).to.be.revertedWith("IBC_Bridge: Unregistered Domain.");
    });

    it("Should reject registration requests for existing domains.", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const newDomainName: string = "Foreign_Bridge";
      const newDomainVersion: string = "1.0.0";
      const newDomainId: number = 1;
      const newDomainAddress: string = user3.address;

      await IBridge.registerDomain(newDomainName, newDomainVersion, newDomainId, newDomainAddress);
      // Registration request for existing domains should be rejected
      await expect(IBridge.registerDomain(newDomainName, newDomainVersion, newDomainId, newDomainAddress)).to.be.revertedWith("EIP712X: Domain already exist");
    });

    it("Should register new valid receiving domains if admin", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const newDomainName: string = "Foreign_Bridge";
      const newDomainVersion: string = "1.0.0";
      const newDomainId: number = 1;
      const newDomainAddress: string = user3.address;

      // Registration request from non-admin accounts should be rejected
      await expect(IBridge.connect(user1).registerDomain(newDomainName, newDomainVersion, newDomainId, newDomainAddress)).to.be.revertedWith("Ownable: caller is not the owner");
      // Register new domain name
      await expect(IBridge.registerDomain(newDomainName, newDomainVersion, newDomainId, newDomainAddress)).to.emit(IBridge, "DomainRegistered");
    });
  
    it("Should allow updates to existing receiver domains", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const newDomainName: string = "Foreign_Bridge";
      const newDomainVersion: string = "1.0.0";
      const newDomainId: number = 1;
      const newDomainAddress: string = user3.address;

      // Change request from non-admin accounts should be rejected
      await expect(IBridge.connect(user1).changeDomain(newDomainAddress, newDomainVersion, newDomainId, newDomainAddress)).to.be.revertedWith("Ownable: caller is not the owner");
      // Change request to unregistered domains should be rejected
      await expect(IBridge.changeDomain(newDomainAddress, newDomainVersion, newDomainId, newDomainAddress)).to.be.revertedWith("EIP712X: Domain does not exist");
      
      await IBridge.registerDomain(newDomainName, newDomainVersion, newDomainId, newDomainAddress);
      // Change request domain
      await expect(IBridge.changeDomain(newDomainName, newDomainVersion, newDomainId, newDomainAddress)).to.emit(IBridge, "DomainChanged");
    });

    it("Should not allow registration or updates to contract's own domain", async () => {
      const { IToken, IBridge, admin, user1, user2, user3 } = await loadFixture(DeployFixture);
      const newDomainName: string = "Foreign_Bridge";
      const newDomainVersion: string = "1.0.0";
      const currentChain: number = (await IBridge.getChainId()).toNumber();;
      const newDomainAddress: string = user3.address;

      await expect(IBridge.registerDomain(newDomainName, newDomainVersion, currentChain, newDomainAddress)).to.be.revertedWith("EIP712X: Cannot change this domain.");
      await expect(IBridge.changeDomain(newDomainAddress, newDomainVersion, currentChain, newDomainAddress)).to.be.revertedWith("EIP712X: Cannot change this domain.");
    });
  });
});

function prepareMsgHash(
  _recipient: string,
  _chainId: number,
  _amount: number,
  _nonce: number,
  _domainName: string,
  _domainVer: string,
  _domainAddress: string
) {

  // Reference encoding layout
  //    domainSeparator: keccak256(abi.encode(typeHash,name,version,chainId,receivingContract)
  //    buildStructHash: keccak256(abi.encode(typeHash,receiver,receivingChainId,amount,nonce))
  //    TypedMsg: keccak256(abi.encodePacked("\x19\x01", domainSeparator, buildStructHash))

  // domainSeparator
  let domainSeparator = domainHash(_domainName, _domainVer, _chainId, _domainAddress);
  // structSeparator
  let structSeparator = structHash(_recipient, _chainId, _amount, _nonce);

  let msg = ethers.utils.solidityKeccak256(["string", "bytes32", "bytes32"], ["\x19\x01", domainSeparator, structSeparator]);
  //let msg = ethers.utils.solidityKeccak256(["bytes32", "bytes32"], [domainSeparator, structSeparator]);
  
  return msg;
}

function domainHash(name: string, version: string, chainId: number, address: string): string {
  // domainSeparator
  let domainTypeHash = ethers.utils.solidityKeccak256(["string"],["EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"]);
  let domainNameHash = ethers.utils.solidityKeccak256(["string"], [name]);
  let domainVersionHash = ethers.utils.solidityKeccak256(["string"], [version]); 
  let domainChainId = chainId;
  let domainAddress = address;     
  // abi.encode
  let encodedDomain = ethers.utils.defaultAbiCoder.encode(
    ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
    [domainTypeHash, domainNameHash, domainVersionHash, domainChainId, domainAddress]);
  return ethers.utils.solidityKeccak256(["bytes"], [encodedDomain]);
}

function structHash(_recipient: string, _chainId: number, _amount: number, _nonce: number): string {
  // domainSeparator
  let structTypeHash = ethers.utils.solidityKeccak256(["string"], ["Transaction(address receiver,uint256 receivingChainId,uint256 amount, uint256 nonce)"]);
  let structReceiver = _recipient;
  let structChainId = _chainId; 
  let structAmount = _amount;
  let structNonce = _nonce;     
  let encodedStruct = ethers.utils.defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256', 'uint256', 'uint256'],
    [structTypeHash, structReceiver, structChainId, structAmount, structNonce]);
  return ethers.utils.solidityKeccak256(["bytes"], [encodedStruct]);
}