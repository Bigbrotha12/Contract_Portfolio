const IBC_Bridge = artifacts.require("IBC_Bridge");
const TestNFT = artifacts.require("TestNFT");

module.exports = async function (deployer, network, accounts) {

    // Account 0 to act as MINTER for test purposes: 0x6fa2dd9407e305771a392952920b855ea5de0916fb030ad72445aa3c179e36bd
    // NFT contract must be deployed first
    // constructor(string memory _name, string memory _symbol)
    await deployer.deploy(TestNFT, "Arcane", "ARC");

    let nft = await TestNFT.deployed();
    // constructor(string memory _name, string memory _version, address _target, address _minter)
    await deployer.deploy(IBC_Bridge, "Test", "1.0.0", nft.address, accounts[0]);
};
