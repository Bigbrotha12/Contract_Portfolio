import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre from 'hardhat';

describe("DemoToken", function () {
    async function TokenDeployFixture() {
        const [admin, whitelistUser, user] = await hre.ethers.getSigners();
        const name: string = "DemoToken";
        const symbol: string = "DEMO";
        const whitelist: Array<string> = [admin.address, whitelistUser.address, user.address];
        const token = await (await hre.ethers.getContractFactory("DemoToken")).deploy(name, symbol, whitelist);
        return { token, admin, whitelistUser, user };
    }

    describe("Deployment", function () {
        it("Should deploy with correct admin.", async () => {
            const { token, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);
        });

        it("Should deploy with correct name and symbol.", async () => {
            const { token, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);
        });
    });

    describe("Whitelist", function () {
        it("Should allow admin to change whitelist status of users.", async () => {
            const { token, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);
        });

        it("Should not allow non-admins to change whitelist status of users.", async () => {
            const { token, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);
        });
    });

    describe("Mint and Burn", function () {
        it("Should allow whitelisted users to mint tokens.", async () => {
            const { token, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);
        });

        it("Should allow whitelisted users to burn tokens.", async () => {
            const { token, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);
        });

        it("Should not allow non-whitelisted users to mint or burn tokens.", async () => {
            const { token, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);
        });
    });
});