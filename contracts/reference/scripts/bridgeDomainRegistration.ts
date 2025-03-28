import "@nomiclabs/hardhat-ethers";
import hre, { ethers } from 'hardhat';
import { abi } from '../artifacts/contracts/C_IBC_Messenger/IBC_Bridge.sol/IBC_Bridge.json';
import { IBC_Bridge } from "../typechain-types/contracts/C_IBC_Messenger/IBC_Bridge";

async function main() {

    const [admin] = await ethers.getSigners();
    console.log("Initiating domain registration procedure on network %s", hre.network.name);

    let contract = getBridgeContract(admin) as IBC_Bridge;
    if (!contract) {
        console.error("No contract instance found on this network.");
    }
    
    if (hre.network.name !== 'goerli') {
        console.log('Registering Goerli domain...');
        let domain = { name: 'Demo Bridge', version: '1.0.0', chainId: '5', address: '0x28408975393ba195305ebe5f5936ce749da67b4a'};
        try {
            await contract.changeDomain(domain.name, domain.version, domain.chainId, domain.address);
        } catch (error) {
            console.error(error);
        }
    }
    if (hre.network.name !== 'binanceTest') {
        console.log('Registering BNB Testnet domain...');
        let domain = { name: 'Demo Bridge', version: '1.0.0', chainId: '97', address: '0xB7Eaa855Fa6432D0597F297BaCE4613c33a075d1'};
        try {
            await contract.changeDomain(domain.name, domain.version, domain.chainId, domain.address);
        } catch (error) {
            console.error(error);
        } 
    }
    if (hre.network.name !== 'polygonTest') {
        console.log('Registering Polygon Testnet domain...');
        let domain = { name: 'Polygon Demo Bridge', version: '1.0.0', chainId: '8001', address: '0x2EF8390d0ED43fD98B785AE414Bb5dd5364d621B'};
        try {
            await contract.changeDomain(domain.name, domain.version, domain.chainId, domain.address);
        } catch (error) {
            console.error(error);
        }
    }
    
    console.log("Registration complete.");
}
main().catch(console.error);

function getBridgeContract(signer) {
    switch (hre.network.name) {
        case "mainnet":
            return null;
        case "goerli":
            return new ethers.Contract("0x28408975393ba195305ebe5f5936ce749da67b4a", abi, signer);
        case "binance":
            return null;
        case "binanceTest":
            return new ethers.Contract("0xB7Eaa855Fa6432D0597F297BaCE4613c33a075d1", abi, signer);
        case "polygon":
            return null;
        case "polygonTest":
            return new ethers.Contract("0x2EF8390d0ED43fD98B785AE414Bb5dd5364d621B", abi, signer);
        case "avalancheCMain":
            return null;
        case "avalancheCTest":
            return null;
        default:
            return null;
    }
}