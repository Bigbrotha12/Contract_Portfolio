import "@nomiclabs/hardhat-ethers";
import hre, { ethers } from 'hardhat';
import deployArgs from './deploymentArgs.json';
import { DemoToken } from '../typechain-types/contracts/A_DemoToken';
import { NFTDemo } from '../typechain-types/contracts/F_Upgradable_NFT';
import { abi as linkAbi } from "../artifacts/@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol/LinkTokenInterface.json";
import { LinkTokenInterface } from "../typechain-types/@chainlink/contracts/src/v0.8/interfaces";
import { CoinFlipper } from "../typechain-types/contracts/G_Oracle_Contract";
import { BigNumber } from "ethers";

async function main() {

    const [admin] = await ethers.getSigners();
    console.log("Initiating deployment procedure on network %s with signer %s", hre.network.name, admin.address);

    //------------------------- DEMO Token ---------------------------
    console.log("Deploying DEMO Token...");
    const DemoToken = await ethers.getContractFactory("DemoToken");
    const demoToken = await DemoToken.deploy(...deployArgs["DemoToken"], [admin.address]);
    await demoToken.deployed();
    let token = demoToken as DemoToken;
    demoToken.address ?
        console.log("DEMO Token successfully deployed at %s", demoToken.address) :
        console.log("DEMO Token failed deployment. Check constructor arguments and ensure you have sufficient ETH for transaction fees.");

    //------------------------ Airdrop Demo --------------------------
    console.log("Deploying Airdrop DEMO...");
    const Airdrop = await ethers.getContractFactory("AirdropDemo");
    const airdrop = await Airdrop.deploy(...deployArgs["AirdropDemo"], demoToken.address);
    await airdrop.deployed();
    await token.changeMinter(airdrop.address, true);
    airdrop.address ?
        console.log("Airdrop DEMO successfully deployed at %s", airdrop.address) :
        console.log("Airdrop DEMO failed deployment. Check constructor arguments and ensure you have sufficient ETH for transaction fees.");

    //------------------------ IBC Bridge ----------------------------
    console.log("Deploying IBC Bridge...");
    const Bridge = await ethers.getContractFactory("IBC_Bridge");
    const bridge = await Bridge.deploy(...deployArgs["IBC_Bridge"], demoToken.address);
    await bridge.deployed();
    await token.changeMinter(bridge.address, true);
    bridge.address ?
        console.log("IBC Bridge successfully deployed at %s", bridge.address) :
        console.log("IBC Bridge failed deployment. Check constructor arguments and ensure you have sufficient ETH for transaction fees.");
    
    //------------------------ Flipper -------------------------------
    console.log("Deploying Coin Flipper...");
    let { linkToken, coordinator, keyHash } = getChainlinkContract();
    if (linkToken && coordinator && keyHash) {
        const Flipper = await ethers.getContractFactory("CoinFlipper");
        const flipper = await Flipper.deploy(...deployArgs["CoinFlipper"], coordinator, keyHash, linkToken, demoToken.address);
        await flipper.deployed();
        // Send link tokens to contract to fund oracle calls
        let linkContract = new ethers.Contract(linkToken, linkAbi, admin);
        let minLink: BigNumber = ethers.utils.parseUnits("10", 18);
        if (await (linkContract as LinkTokenInterface).balanceOf(admin.address) >= minLink) {
            let transferTx = await (linkContract as LinkTokenInterface).transfer(flipper.address, minLink);
            await transferTx.wait();
            await (flipper as CoinFlipper).fundOracle();
        }
        await token.changeMinter(flipper.address, true);
        flipper.address ?
        console.log("Coin Flipper successfully deployed at %s", flipper.address) :
        console.log("Coin Flipper failed deployment. Check constructor arguments and ensure you have sufficient ETH for transaction fees.");
    } else {
        console.log("Coin Flipper deployment failed due to missing oracle parameters. Network: %s", hre.network.name);
    }

    //------------------------ Reflect Token --------------------------
    console.log("Deploying Reflect Token...");
    const Reflect = await ethers.getContractFactory("ReflectToken");
    const reflect = await Reflect.deploy(...deployArgs["ReflectToken"], demoToken.address);
    await reflect.deployed();
    await token.changeMinter(reflect.address, true);
    reflect.address ?
        console.log("Reflect Token successfully deployed at %s", reflect.address) :
        console.log("Reflect Token failed deployment. Check constructor arguments and ensure you have sufficient ETH for transaction fees.");

    //------------------------ Staker ---------------------------------
    console.log("Deploying Staker...");
    const Staker = await ethers.getContractFactory("Staker");
    const staker = await Staker.deploy(...deployArgs["Staker"], demoToken.address, demoToken.address);
    await staker.deployed();
    await token.changeMinter(staker.address, true);
    staker.address ?
        console.log("Staker successfully deployed at %s", staker.address) :
        console.log("Staker failed deployment. Check constructor arguments and ensure you have sufficient ETH for transaction fees.");

    //------------------------- NFT -----------------------------------
    console.log("Deploying NFT Logic...");
    const NFTLogic = await ethers.getContractFactory("FamiliarLogic");
    const NFTProxy = await ethers.getContractFactory("NFTDemo");
    const nftLogic = await NFTLogic.deploy(deployArgs["FamiliarLogic"]);
    await nftLogic.deployed();
    nftLogic.address ?
        console.log("NFT Logic successfully deployed at %s", nftLogic.address) :
        console.log("NFT Logic failed deployment. Check constructor arguments and ensure you have sufficient ETH for transaction fees.");

    console.log("Deploying NFT Proxy...");
    const nftProxy = await NFTProxy.deploy(...deployArgs["NFTDemo"], [admin.address]);
    await nftProxy.deployed();
    nftProxy.address ?
        console.log("NFT Proxy successfully deployed at %s", nftProxy.address) :
        console.log("NFT Proxy failed deployment. Check constructor arguments and ensure you have sufficient ETH for transaction fees.");

    let proxy = nftProxy as NFTDemo;
    // Initialization
    // [0]: Version | [1]: Name | [2]: Symbol | [3]: RootURI
    const version: string = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("1.0.0"));
    const name: string = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("NFT Demo"));
    const symbol: string = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("NFTD"));
    const rootURI: string = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("https://picsum.photos/"));
    const initData: Array<string> = [version, name, symbol, rootURI];
    console.log("Initializing NFT Demo contract...");
    await proxy.upgradeInit(nftLogic.address, initData);
    console.log("Deployment procedure complete.");
};

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
})

function getChainlinkContract(): {linkToken: string, coordinator: string, keyHash: string} {
    switch (hre.network.name) {
        case "mainnet":
            return { linkToken: "0x514910771AF9Ca656af840dff83E8264EcF986CA", coordinator: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909", keyHash: "0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef" };
        case "goerli":
            return { linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB", coordinator: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D", keyHash: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15" };
        case "binance":
            return { linkToken: "0x404460C6A5EdE2D891e8297795264fDe62ADBB75", coordinator: "0xc587d9053cd1118f25F645F9E08BB98c9712A4EE", keyHash: "0x114f3da0a805b6a67d6e9cd2ec746f7028f1b7376365af575cfea3550dd1aa04" };
        case "binanceTest":
            return { linkToken: "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06", coordinator: "0x6A2AAd07396B36Fe02a22b33cf443582f682c82f", keyHash: "0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314" };
        case "polygon":
            return { linkToken: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1", coordinator: "0xAE975071Be8F8eE67addBC1A82488F1C24858067", keyHash: "0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93" };
        case "polygonTest":
            return { linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB", coordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed", keyHash: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f" };
        case "avalancheCMain":
            return { linkToken: "0x5947BB275c521040051D82396192181b413227A3", coordinator: "0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634", keyHash: "0x83250c5584ffa93feb6ee082981c5ebe484c865196750b39835ad4f13780435d" };
        case "avalancheCTest":
            return { linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846", coordinator: "0x2eD832Ba664535e5886b75D64C46EB9a228C2610", keyHash: "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61" };
        default:
            return { linkToken: "", coordinator: "", keyHash: ""};
    }
}