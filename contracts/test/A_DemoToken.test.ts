import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre from 'hardhat';
import { DemoToken } from './../typechain-types/contracts/A_DemoToken/index';

describe("DemoToken", function () {
    async function TokenDeployFixture() {
        const [admin, whitelistUser, user] = await hre.ethers.getSigners();
        const name: string = "DemoToken";
        const symbol: string = "DEMO";
        const limit: number = 1000;
        const whitelist: Array<string> = [admin.address, whitelistUser.address];
        const token = await (await hre.ethers.getContractFactory("DemoToken")).deploy(name, symbol, whitelist, limit);
        
        const IToken = token as DemoToken;
        return { IToken, admin, whitelistUser, user };
    }

    describe("Deployment", function () {
        it("Should deploy with correct admin.", async () => {
            const { IToken, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);

            expect(await IToken.owner()).to.be.equal(admin.address);
        });

        it("Should deploy with correct name and symbol.", async () => {
            const { IToken, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);

            expect(await IToken.name()).to.be.equal("DemoToken");
            expect(await IToken.symbol()).to.be.equal("DEMO");
        });
    });

    describe("Whitelist", function () {
        it("Should allow admin to change whitelist status of users.", async () => {
            const { IToken, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);

            expect(await IToken.isMinter(user.address)).to.be.equal(false);
            await IToken.changeMinter(user.address, true);
            expect(await IToken.isMinter(user.address)).to.be.equal(true);
        });

        it("Should not allow non-admins to change whitelist status of users.", async () => {
            const { IToken, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);

            await expect(IToken.connect(whitelistUser).changeMinter(user.address, true)).to.be.revertedWith("DemoToken: Unauthorized.");
        });
    });

    describe("Mint and Burn", function () {
        it("Should allow whitelisted users to mint tokens.", async () => {
            const { IToken, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);
            const MINT_AMOUNT = 100;

            expect(await IToken.balanceOf(user.address)).to.be.equal(0);
            await IToken.connect(whitelistUser).mintTo(user.address, MINT_AMOUNT);
            expect(await IToken.balanceOf(user.address)).to.be.equal(MINT_AMOUNT);
        });

        it("Should allow whitelisted users to burn tokens.", async () => {
            const { IToken, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);
            const BURN_AMOUNT = 100;

            await IToken.connect(whitelistUser).mintTo(user.address, BURN_AMOUNT);
            expect(await IToken.balanceOf(user.address)).to.be.equal(BURN_AMOUNT);
            await IToken.connect(whitelistUser).burnFrom(user.address, BURN_AMOUNT);
            expect(await IToken.balanceOf(user.address)).to.be.equal(0);
        });

        it("Should not allow non-whitelisted users to mint or burn tokens.", async () => {
            const { IToken, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);
            const MINT_AMOUNT = 100;

            await expect(IToken.connect(user).mintTo(whitelistUser.address, MINT_AMOUNT)).to.be.revertedWith("DemoToken: Unauthorized Mint.");
            await expect(IToken.connect(user).burnFrom(whitelistUser.address, MINT_AMOUNT)).to.be.revertedWith("DemoToken: Unauthorized Burn.")
        });

        it("Should not allow mints greater than the per-mint limit.", async () => {
            const { IToken, admin, whitelistUser, user } = await loadFixture(TokenDeployFixture);
            const MINT_LIMIT = 1000;

            await expect(IToken.mintTo(user.address, MINT_LIMIT + 1)).to.be.revertedWith("DemoToken: Mint amount over per-mint limit.");
        });
    });
});