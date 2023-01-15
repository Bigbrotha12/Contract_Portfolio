import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import { ethers } from 'hardhat';
import Merkle from './../scripts/merkleRootCalculator';
import { DemoToken } from './../typechain-types/contracts/A_DemoToken/index';
import { AirdropDemo } from './../typechain-types/contracts/B_Airdrop/index';

describe("AirdropDemo", function () {
  async function DeployFixture() {
    const [admin, user1, user2, user3] = await ethers.getSigners();
    const name: string = "DemoToken";
    const symbol: string = "DEMO";
    const limit: number = 1000;
    const whitelist: Array<string> = [admin.address, user1.address];

    const token = await (await ethers.getContractFactory("DemoToken")).deploy(name, symbol, whitelist);
    const airdrop = await (await ethers.getContractFactory("AirdropDemo")).deploy(limit, token.address);
    await token.changeMinter(airdrop.address, true);

    const IToken = token as DemoToken;
    const IAirdrop = airdrop as AirdropDemo;
    return { IToken, IAirdrop, admin, user1, user2, user3 };
  };

  describe("Deployment", function () {
    it("Should initialize to correct owner and token", async () => {
      const { IToken, IAirdrop, admin, user1, user2, user3  } = await loadFixture(DeployFixture);

      expect(await IAirdrop.owner()).to.be.equal(admin.address);
      expect(await IAirdrop.demoToken()).to.be.equal(IToken.address);
    });
  });
  
  describe("Root Setting and Claiming", function () {
    it("Should allow multiple users to set airdrop roots concurrently.", async () => {
      const { IToken, IAirdrop, admin, user1, user2, user3  } = await loadFixture(DeployFixture);
      const ZERO = "0x0000000000000000000000000000000000000000000000000000000000000000";
      const ROOT1 = "0x1000000000000000000000000000000000000000000000000000000000000000";
      const ROOT2 = "0x2000000000000000000000000000000000000000000000000000000000000000";
    
      expect(await IAirdrop.merkleRoot(user1.address)).to.be.equal(ZERO);
      expect(await IAirdrop.merkleRoot(user2.address)).to.be.equal(ZERO);
      
      await IAirdrop.connect(user1).createAirdrop(ROOT1);
      await IAirdrop.connect(user2).createAirdrop(ROOT2);

      expect(await IAirdrop.merkleRoot(user1.address)).to.be.equal(ROOT1);
      expect(await IAirdrop.merkleRoot(user2.address)).to.be.equal(ROOT2);
    });

    it("should allow valid claim within claim limit", async () => {
      const { IToken, IAirdrop, admin, user1, user2, user3  } = await loadFixture(DeployFixture);
      const sample1 = [
        {
            "to": user1.address,
            "amount": "500" 
        },
        {
            "to": user2.address,
            "amount": "200" 
        },
        {
            "to": user3.address, 
            "amount": "1300"
        }, 
        {
            "to": "0x0000000000000000000000000000000000000000",
            "amount": "0" 
        }
      ];

      // Create airdrop
      const root1 = Merkle.calculateMerkleRoot(Merkle.createLeaves(sample1));
      await IAirdrop.connect(user3).createAirdrop(root1);

      // Calculate proof for user 1
      const leaf = Merkle.getLeafAtIndex(0, sample1);
      const leaves = Merkle.createLeaves(sample1);
      const proof = Merkle.calculateProof(leaf, leaves);

      // Claim 500 tokens for user 1
      expect(await IToken.balanceOf(user1.address)).to.be.equal(0);
      await IAirdrop.connect(user1).claim(user3.address, user1.address, 500, proof);
      expect(await IToken.balanceOf(user1.address)).to.be.equal(500);
      
      // Calculate proof for user 3
      const leaf2 = Merkle.getLeafAtIndex(2, sample1);
      const leaves2 = Merkle.createLeaves(sample1);
      const proof2 = Merkle.calculateProof(leaf2, leaves2);

      // Attempts to claim tokens over the limit should fail
      await expect(IAirdrop.connect(user3).claim(user3.address, user3.address, 1300, proof2))
        .to.be.revertedWith("AirdropDemo: Claim amount greater than limit.");
    });

    it("should allow valid claim across concurrent airdrops", async () => {
      const { IToken, IAirdrop, admin, user1, user2, user3  } = await loadFixture(DeployFixture);
      const sample1 = [
        {
            "to": user1.address,
            "amount": "500" 
        },
        {
            "to": user2.address,
            "amount": "200" 
        },
        {
            "to": user3.address, 
            "amount": "1300"
        }, 
        {
            "to": "0x0000000000000000000000000000000000000000",
            "amount": "0" 
        }
      ];
      const sample2 = [
        {
            "to": user1.address,
            "amount": "30" 
        },
        {
            "to": user2.address,
            "amount": "40" 
        },
        {
            "to": user3.address, 
            "amount": "50"
        }, 
        {
            "to": "0x0000000000000000000000000000000000000000",
            "amount": "0" 
        }
      ];

      // Create airdrop 1
      const root1 = Merkle.calculateMerkleRoot(Merkle.createLeaves(sample1));
      await IAirdrop.connect(user1).createAirdrop(root1);

      // Create airdrop 2
      const root2 = Merkle.calculateMerkleRoot(Merkle.createLeaves(sample2));
      await IAirdrop.connect(user2).createAirdrop(root2);

      // Calculate proof for user 1 for airdrop 1
      const leaf1 = Merkle.getLeafAtIndex(0, sample1);
      const leaves1 = Merkle.createLeaves(sample1);
      const proof1 = Merkle.calculateProof(leaf1, leaves1);

      // Calculate proof for user 1 for airdrop 2
      const leaf2 = Merkle.getLeafAtIndex(0, sample2);
      const leaves2 = Merkle.createLeaves(sample2);
      const proof2 = Merkle.calculateProof(leaf2, leaves2);

      // Claim 500 tokens for user 1 for airdrop 1
      expect(await IToken.balanceOf(user1.address)).to.be.equal(0);
      await IAirdrop.connect(user1).claim(user1.address, user1.address, 500, proof1);
      expect(await IToken.balanceOf(user1.address)).to.be.equal(500);

      // Second claim attempt for user 1 airdrop 1 should fail
      await expect(IAirdrop.connect(user1).claim(user1.address, user1.address, 500, proof1))
        .to.be.revertedWith("AirdropDemo: Already claimed.");
      
      // Claim 30 tokens for user 1 for airdrop 2
      expect(await IToken.balanceOf(user1.address)).to.be.equal(500);
      await IAirdrop.connect(user1).claim(user2.address, user1.address, 30, proof2);
      expect(await IToken.balanceOf(user1.address)).to.be.equal(530);

      // Second claim attempt for user 1 airdrop 2 should fail
      await expect(IAirdrop.connect(user1).claim(user2.address, user1.address, 30, proof2))
        .to.be.revertedWith("AirdropDemo: Already claimed.");
    });
  
    it("should forbid claiming twice from same address", async () => {
      const { IToken, IAirdrop, admin, user1, user2, user3  } = await loadFixture(DeployFixture);
      const sample1 = [
        {
            "to": user1.address,
            "amount": "500" 
        },
        {
            "to": user2.address,
            "amount": "200" 
        },
        {
            "to": user3.address, 
            "amount": "1300"
        }, 
        {
            "to": "0x0000000000000000000000000000000000000000",
            "amount": "0" 
        }
      ];

      // Create airdrop
      const root1 = Merkle.calculateMerkleRoot(Merkle.createLeaves(sample1));
      await IAirdrop.connect(user3).createAirdrop(root1);

      // Calculate proof for user 1
      const leaf = Merkle.getLeafAtIndex(0, sample1);
      const leaves = Merkle.createLeaves(sample1);
      const proof = Merkle.calculateProof(leaf, leaves);

      // Claim 500 tokens for user 1
      expect(await IToken.balanceOf(user1.address)).to.be.equal(0);
      await IAirdrop.connect(user1).claim(user3.address, user1.address, 500, proof);
      expect(await IToken.balanceOf(user1.address)).to.be.equal(500);

      // Second claim attempt should fail
      await expect(IAirdrop.connect(user1).claim(user3.address, user1.address, 500, proof)).to.be.revertedWith("AirdropDemo: Already claimed.");
    });

    it("should forbid claiming with incorrect address or amount", async () => {
      const { IToken, IAirdrop, admin, user1, user2, user3  } = await loadFixture(DeployFixture);
      const sample1 = [
        {
            "to": user1.address,
            "amount": "500" 
        },
        {
            "to": user2.address,
            "amount": "200" 
        },
        {
            "to": user3.address, 
            "amount": "1300"
        }, 
        {
            "to": "0x0000000000000000000000000000000000000000",
            "amount": "0" 
        }
      ];

      // Create airdrop
      const root1 = Merkle.calculateMerkleRoot(Merkle.createLeaves(sample1));
      await IAirdrop.createAirdrop(root1);

      // Calculate proof for user 1
      const leaf = Merkle.getLeafAtIndex(0, sample1);
      const leaves = Merkle.createLeaves(sample1);
      const proof = Merkle.calculateProof(leaf, leaves);

      // Claim 600 [incorrect] tokens for user 1 [correct]
      expect(await IToken.balanceOf(user1.address)).to.be.equal(0);
      // Claim 500 [correct] tokens for user 2 [incorrect]
      await expect(IAirdrop.connect(user1).claim(user3.address, user1.address, 600, proof)).to.be.revertedWith("AirdropDemo: Invalid data.");
      await expect(IAirdrop.connect(user1).claim(user3.address, user2.address, 500, proof)).to.be.revertedWith("AirdropDemo: Invalid data.");
    });
  });
});
