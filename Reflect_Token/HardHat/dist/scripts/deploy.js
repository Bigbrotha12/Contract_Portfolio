"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hardhat_1 = require("hardhat");
async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');
    // We get the contract to deploy
    const accounts = await hardhat_1.ethers.getSigners();
    const FOT = await hardhat_1.ethers.getContractFactory("FeeOnTransfer");
    const feeToken = await FOT.deploy(100000, accounts[0].address, [accounts[1].address, accounts[2].address, accounts[3].address, accounts[4].address, accounts[5].address]);
    await feeToken.deployed();
    console.log("FeeToken deployed to:", feeToken.address);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
