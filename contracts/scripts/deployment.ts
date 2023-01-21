import "@nomiclabs/hardhat-ethers";
import { ethers } from 'hardhat';
import deployArgs from './deploymentArgs.json';
import { DemoToken } from '../typechain-types/contracts/A_DemoToken';
import { NFTDemo } from '../typechain-types/contracts/F_Upgradable_NFT';

async function main() {

    const [admin] = await ethers.getSigners();

    const DemoToken = await ethers.getContractFactory("DemoToken");
    const Airdrop = await ethers.getContractFactory("AirdropDemo");
    const Bridge = await ethers.getContractFactory("IBC_Bridge");
    const Flipper = await ethers.getContractFactory("CoinFlipper");
    const Reflect = await ethers.getContractFactory("ReflectToken");
    const Staker = await ethers.getContractFactory("Staker");
    const NFTLogic = await ethers.getContractFactory("FamiliarLogic");
    const NFTProxy = await ethers.getContractFactory("NFTDemo");

    const demoToken = await DemoToken.deploy(...deployArgs["DemoToken"], [admin.address]);
    await demoToken.deployed();
    const airdrop = await Airdrop.deploy(...deployArgs["AirdropDemo"], demoToken.address);
    await airdrop.deployed();
    const bridge = await Bridge.deploy(...deployArgs["IBC_Bridge"], demoToken.address);
    await bridge.deployed();
    const flipper = await Flipper.deploy(...deployArgs["CoinFlipper"], demoToken.address);
    await flipper.deployed();
    const reflect = await Reflect.deploy(...deployArgs["ReflectToken"], demoToken.address);
    await reflect.deployed();
    const staker = await Staker.deploy(...deployArgs["Staker"], demoToken.address, demoToken.address);
    await staker.deployed();
    const nftLogic = await NFTLogic.deploy(deployArgs["FamiliarLogic"]);
    await nftLogic.deployed();
    const nftProxy = await NFTProxy.deploy(...deployArgs["NFTDemo"], [admin.address]);
    await nftProxy.deployed();

    let token = demoToken as DemoToken;
    let proxy = nftProxy as NFTDemo;
    await token.changeMinter(airdrop.address, true);
    await token.changeMinter(bridge.address, true);
    await token.changeMinter(flipper.address, true);
    await token.changeMinter(staker.address, true);

    // Initialization
    // [0]: Version | [1]: Name | [2]: Symbol | [3]: RootURI
    const version: string = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("1.0.0"));
    const name: string = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("NFT Demo"));
    const symbol: string = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("NFTD"));
    const rootURI: string = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("https://picsum.photos/"));
    const initData: Array<string> = [version, name, symbol, rootURI];
    await proxy.upgradeInit(nftLogic.address, initData);
};

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
})