const IBC_Bridge = artifacts.require("IBC_Bridge");
const TestNFT = artifacts.require("TestNFT");

module.exports = async function (deployer, accounts) {

    // Account 0 to act as MINTER for test purposes
    // NFT contract must be deployed first
    // constructor(string memory _name, string memory _symbol)
    await deployer.deploy(TestNFT, "Arcane", "ARC");

    let nft = await TestNFT.deployed();
    // constructor(string memory _name, string memory _version, address _target, address _minter)
    await deployer.deploy(IBC_Bridge, "ARC_Bridge", "1.0.0", nft.address, accounts[0]);
};
