import { ethers } from 'hardhat';

async function main() {

    const [admin] = await ethers.getSigners();

    const DemoToken = await ethers.getContractFactory("DemoToken");
    const Airdrop = await ethers.getContractFactory("AirdropDemo");
    const Bridge = await ethers.getContractFactory("IBC_Bridge");
    const Flipper = await ethers.getContractFactory("CoinFlipper");
    const Reflect = await ethers.getContractFactory("ReflectToken");
    const Staker = await ethers.getContractFactory("Staking");
    const NFTLogic = await ethers.getContractFactory("FamiliarLogic");
    const NFTProxy = await ethers.getContractFactory("NFTDemo");
    const NFTStorage = await ethers.getContractFactory("CommonStorage");
};

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
})