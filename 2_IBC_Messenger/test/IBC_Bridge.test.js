const IBC_Bridge = artifacts.require("IBC_Bridge");
const TestNFT = artifacts.require("TestNFT");
const truffleAssert = require('truffle-assertions');
//const {constants, expectEvent} = require('@openzeppelin/test-helpers/src/expectEvent');
const env = require('./env');

contract("IBC_Bridge", (accounts) => {
  // MINTER Wallet
  let MINTER = '0xCea544Feb7B210Eb15B609e6Fbde294f595008Fa';

  it("should initialize to correct domain hash", async () => {
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
    let bridgeInst = await IBC_Bridge.deployed();

    let domainTypeHash = web3.utils.soliditySha3("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    let domainNameHash = web3.utils.soliditySha3("Foreign Bridge");
    let domainVersionHash = web3.utils.soliditySha3("1.1.0"); 
    let domainChainId = 3;
    let domainAddress = accounts[1];     
    // abi.encode
    let encodedDomain = web3.eth.abi.encodeParameters(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [domainTypeHash, domainNameHash, domainVersionHash, domainChainId, domainAddress]);
    let domainHash = web3.utils.soliditySha3(encodedDomain);
    let currentDomain = await bridgeInst.buildDomainHash(domainNameHash, domainVersionHash, domainChainId, domainAddress);
 
    assert.equal(domainHash, currentDomain, "Domain hash creation error");
  });

  it("should build valid struct hashes", async () => {
    let bridgeInst = await IBC_Bridge.deployed();

    let structTypeHash = web3.utils.soliditySha3("Transaction(address receiver,uint256 receivingChainId,uint256 tokenId, uint256 nonce)");
    let structReceiver = accounts[1];
    let structChainId = 1337; 
    let structTokenId = 5;
    let structNonce = 1;     
    // abi.encode
    let encodedStruct = web3.eth.abi.encodeParameters(
      ['bytes32', 'address', 'uint256', 'uint256', 'uint256'],
      [structTypeHash, structReceiver, structChainId, structTokenId, structNonce]);
    let structHash = web3.utils.soliditySha3(encodedStruct);
    let builtStruct = await bridgeInst.buildStructHash(structReceiver, structChainId, structTokenId, structNonce);
 
    assert.equal(structHash, builtStruct, "Struct hash creation error");
  });

  it("should conform to TypedDataV4 message signing", async () => {
    let bridgeInst = await IBC_Bridge.deployed();

    let domainChainId = await bridgeInst.getChainId();
    let domainAddress = await bridgeInst.getAddress(); 
    let structReceiver = accounts[1];
    let structChainId = 1337;
    let structTokenId = 5;
    let structNonce = 1;
    let builtStruct = await bridgeInst.buildStructHash(structReceiver, structChainId, structTokenId, structNonce);
    //let msg = await bridgeInst.getTypedDataHash(builtStruct);
    let msg = prepareMsgHash(structReceiver, structChainId, structTokenId, structNonce, domainAddress, domainChainId);
    let prefixMsg = await bridgeInst.getPrefixedDataHash(builtStruct);
    let signedMsg = web3.eth.accounts.sign(msg, env.PRIV_KEY);          // Web3 module will prefix according to TypedDataV4

    //Check that contract struct hashing and prefixing works correctly
    let recoveredPKey = web3.eth.accounts.recover(prefixMsg, signedMsg.signature, true);

    assert.equal(recoveredPKey, MINTER, "Structured message composition error");
  });

  it("should execute valid mint requests", async () => {
    let bridgeInst = await IBC_Bridge.deployed();
    let nft = await TestNFT.deployed();

    // Set IBC endpoint as authorized NFT minter
    await nft.initEndpoint(bridgeInst.address);

    // Check tokenId: 5 is not minted
    truffleAssert.fails(nft.ownerOf(5), "ERC721: invalid token ID");

    // Prepare 2 message hash for signing
    let domainChainId = await bridgeInst.getChainId();
    let domainAddress = await bridgeInst.getAddress(); 
    let msg1 = prepareMsgHash(accounts[1], domainChainId, 5, 0, domainAddress, domainChainId);
    let msg2 = prepareMsgHash(accounts[5], domainChainId, 4, 1, domainAddress, domainChainId);
    let signedMsg1 = web3.eth.accounts.sign(msg1, env.PRIV_KEY);  // Returns signed message object
    let signedMsg2 = web3.eth.accounts.sign(msg2, env.PRIV_KEY);  // Returns signed message object

    // Relay mint request to bridge
    let mintTx1 = await bridgeInst.dataReceive(accounts[1], 1337, 5, signedMsg1.signature);
    let mintTx2 = await bridgeInst.dataReceive(accounts[5], 1337, 4, signedMsg2.signature);

    // Check tokenId: 5 and 4 are minted to accounts[1] and accounts[5]
    tokenOwner = await nft.ownerOf(5);
    assert(tokenOwner, accounts[1], "ERROR: Token ID 5 was not minted");
    assert(tokenOwner, accounts[5], "ERROR: Token ID 4 was not minted");
    truffleAssert.eventEmitted(mintTx1, "DataReceived");
    truffleAssert.eventEmitted(mintTx2, "DataReceived");
  });

  it("should execute valid burn requests", async () => {
    let bridgeInst = await IBC_Bridge.deployed();
    let nft = await TestNFT.deployed();

    // Check tokenId: 5 is minted to accounts[1]
    assert(accounts[1], await nft.ownerOf(5), "Token ID 5 not minted to accounts[1]");

    // Register Chain ID "1" as receiving domain 
    await bridgeInst.registerDomain("Foreign_Bridge", "1.0.0", 1, accounts[5]);

    // Prepare NFT transfer -- 3 transactions test, 2 invalid, 1 valid
    // Invalid TX#1: Send NFT not owned by sender
    truffleAssert.fails(bridgeInst.dataSend(accounts[1], 4, 1), "IBC_Bridge: Unauthorized transfer");
    // Invalid TX#2: Send NFT to unregistered domain
    truffleAssert.fails(bridgeInst.dataSend(accounts[1], 5, 777, {from: accounts[1]}), "IBC_Bridge: Unregistered Domain");
    // Valid TX#3: Send NFT message
    let burnTx = await bridgeInst.dataSend(accounts[1], 5, 1, {from: accounts[1]});
    truffleAssert.eventEmitted(burnTx, "DataSent");

    // Check tokenId: 5 is burned from accounts[1]
    truffleAssert.fails(nft.ownerOf(5), "ERC721: invalid token ID");
  });

  it("should register new valid receiving domains if admin", async () => {
    let bridgeInst = await IBC_Bridge.deployed();

    // Attempt send transaction to unregistered domain
    truffleAssert.fails(bridgeInst.dataSend(accounts[5], 4, 777, {from: accounts[5]}), "IBC_Bridge: Unregistered Domain");
    
    // Registration request from non-admin accounts should be rejected
    truffleAssert.fails(bridgeInst.registerDomain("Foreign_Bridge", "1.0.0", 777, accounts[5], {from: accounts[1]}), "Ownable: caller is not the owner");
    // Registration request for existing domains should be rejected
    truffleAssert.fails(bridgeInst.registerDomain("Foreign_Bridge", "1.0.0", 1, accounts[5]), "EIP712X: Domain already exist");
    // Register new domain name: "Foreign_Bridge", version: 1.0.0, chain: 777, address: accounts[5]
    let tx = await bridgeInst.registerDomain("Foreign_Bridge", "1.0.0", 777, accounts[5]);

    // Attempt same transaction after domain registration
    truffleAssert.passes(bridgeInst.dataSend(accounts[5], 4, 777, {from: accounts[5]}));
    truffleAssert.eventEmitted(tx, "DomainRegistered");
  });

  it("should change existing receiver domains", async () => {
    let bridgeInst = await IBC_Bridge.deployed();

    // Change request from non-admin accounts should be rejected
    truffleAssert.fails(bridgeInst.changeDomain("Foreign_Bridge", "1.0.0", 777, accounts[5], {from: accounts[1]}), "Ownable: caller is not the owner");
    // Change request to unregistered domains should be rejected
    truffleAssert.fails(bridgeInst.changeDomain("Foreign_Bridge", "1.0.0", 999, accounts[5]), "EIP712X: Domain does not exist");
    // Change request domain name: "Foreign_Bridge", version: 1.4.0, chain: 777, address: accounts[7]
    let tx = await bridgeInst.changeDomain("Foreign_Bridge", "1.4.0", 777, accounts[7]);
    truffleAssert.eventEmitted(tx, "DomainChanged");
  });
});

function prepareMsgHash(_recipient, _chainId, _tokenId, _nonce, _domainAddress, _domainChain) {

  //    domainSeparator: keccak256(abi.encode(typeHash,name,version,chainId,receivingContract)
  //    buildStructHash: keccak256(abi.encode(typeHash,receiver,receivingChainId,tokenId,nonce))
  //    TypedMsg: keccak256(abi.encodePacked("\x19\x01", domainSeparator, buildStructHash))

  // domainSeparator
  let domainTypeHash = web3.utils.soliditySha3("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
  let domainNameHash = web3.utils.soliditySha3("Test");
  let domainVersionHash = web3.utils.soliditySha3("1.0.0"); 
  let domainChainId = _domainChain;
  let domainAddress = _domainAddress;     
  let encodedDomain = web3.eth.abi.encodeParameters(
    ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
    [domainTypeHash, domainNameHash, domainVersionHash, domainChainId, domainAddress]);
  let domainHash = web3.utils.soliditySha3(encodedDomain);

  // buildStructHash
  let structTypeHash = web3.utils.soliditySha3("Transaction(address receiver,uint256 receivingChainId,uint256 tokenId, uint256 nonce)");
  let structReceiver = _recipient;
  let structChainId = _chainId; 
  let structTokenId = _tokenId;
  let structNonce = _nonce;     
  let encodedStruct = web3.eth.abi.encodeParameters(
    ['bytes32', 'address', 'uint256', 'uint256', 'uint256'],
    [structTypeHash, structReceiver, structChainId, structTokenId, structNonce]);
  let structHash = web3.utils.soliditySha3(encodedStruct);

  let msg = web3.utils.soliditySha3("\x19\x01", {t: "bytes32", v: domainHash}, {t: "bytes32", v: structHash});
  return msg;
}