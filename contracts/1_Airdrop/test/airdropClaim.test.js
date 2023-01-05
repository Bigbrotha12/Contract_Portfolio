const airdropClaim = artifacts.require("AirdropClaim");
const airdropToken = artifacts.require("AirdropToken");
const truffleAssert = require('truffle-assertions');
const { time, expectRevert } = require('@openzeppelin/test-helpers');

const airdrop = require('../scripts/airdropData.json');
const expectEvent = require('@openzeppelin/test-helpers/src/expectEvent');

contract("airdropClaim", (accounts) => {
  let leaves = createLeaves(airdrop.airdropRecipient);
  let root = calculateMerkleRoot(leaves);

  it("should initialize to correct parameters", async () => {
    let tokenInst = await airdropToken.deployed();
    let airdropInst = await airdropClaim.deployed();

    let contractRoot = await airdropInst.merkleRoot.call();
    let contractOwner = await airdropInst.owner.call();
    let contractToken = await airdropInst.airdropToken.call();
    let contractDeadline = await airdropInst.deadline.call();
    let blockNum = await time.latestBlock();
    let deadline = blockNum.toNumber() + 9;

    assert.equal(contractRoot, root[0], "Root initialization error");
    assert.equal(contractOwner, accounts[0], "Owner initialization error");
    assert.equal(contractToken, tokenInst.address, "Token initialization error");
    assert.equal(contractDeadline.toString(), deadline.toString(), "Deadline initialization error");
  });

  it("should allow valid claim within deadline", async () => {
    let tokenInst = await airdropToken.deployed();
    let airdropInst = await airdropClaim.deployed();

    // Funding contract
    await tokenInst.approve(airdropInst.address, 1000, {from: accounts[0]});
    await airdropInst.depositERC20(1000, {from: accounts[0]});

    // Check if within deadline
    let blockNum = await time.latestBlock();
    let deadline = await airdropInst.deadline.call();
    assert(blockNum.toString() <= deadline.toString(), "Error: Deadline expired");

    //valid claim: 
    //      index 0 = { to: accounts[0], amount: 500 }
    //      index 1 = { to: accounts[1], amount: 200 }
    let leaf = getLeafAtIndex(0, airdrop.airdropRecipient);
    let proof = calculateProof(leaf, leaves);
    let claimTx = await airdropInst.claim(accounts[0], 500, proof, {from: accounts[0]});
    
    expectEvent(claimTx, "Claimed", { to: accounts[0], amount: '500' }, "Valid claim failed");
  });

  it("should forbid invalid claim within deadline", async () => {
    let tokenInst = await airdropToken.deployed();
    let airdropInst = await airdropClaim.deployed();

    // Funding done previous step. Remaining balance 500

    // Check if within deadline
    let blockNum = await time.latestBlock();
    let deadline = await airdropInst.deadline.call();
    assert(blockNum.toString() <= deadline.toString(), "Error: Deadline expired");

    //valid claim: 
    //      index 0 = { to: accounts[0], amount: 500 } <- Claimed!
    //      index 1 = { to: accounts[1], amount: 200 }
    let leaf = getLeafAtIndex(1, airdrop.airdropRecipient);
    let proof = calculateProof(leaf, leaves);
    
    expectRevert.unspecified(airdropInst.claim(accounts[0], 500, proof, {from: accounts[0]}));
    expectRevert.unspecified(airdropInst.claim(accounts[1], 500, proof, {from: accounts[1]}));
  });

  it("should not allow owner to withdraw unclaimed tokens before deadline", async () => {
    let tokenInst = await airdropToken.deployed();
    let airdropInst = await airdropClaim.deployed();

    // Funding done previous step. Remaining balance 500

    // check deadline not expired
    let deadline = await airdropInst.deadline.call();
    let blockNum = await time.latestBlock(); 
    assert(blockNum.toString() <= deadline.toString(), "Error: Deadline expired");

    truffleAssert.fails(airdropInst.recoverERC20({from: accounts[0]}), "AirdropClaim: Airdrop still active");
  });

  it("should forbid valid claim after deadline", async () => {
    let tokenInst = await airdropToken.deployed();
    let airdropInst = await airdropClaim.deployed();

    // Funding done previous step. Remaining balance 500

    // Advance 10 blocks and check deadline expired
    let deadline = await airdropInst.deadline.call();
    await time.advanceBlockTo(deadline.toNumber() + 1);
    let blockNum = await time.latestBlock(); 
    assert(blockNum.toString() > deadline.toString(), "Error: Deadline not expired");

    //valid claim: 
    //      index 0 = { to: accounts[0], amount: 500 } <- Claimed!
    //      index 1 = { to: accounts[1], amount: 200 } <- Unclaimed
    let leaf = getLeafAtIndex(1, airdrop.airdropRecipient);
    let proof = calculateProof(leaf, leaves);

    expectRevert(airdropInst.claim(accounts[1], 200, proof, {from: accounts[1]}), "AirdropClaim: Claiming period expired");
  });

  it("should only allow owner to withdraw unclaimed tokens after deadline", async () => {
    let tokenInst = await airdropToken.deployed();
    let airdropInst = await airdropClaim.deployed();

    // Funding done previous step. Remaining balance 500

    // check deadline expired
    let deadline = await airdropInst.deadline.call();
    let blockNum = await time.latestBlock(); 
    assert(blockNum.toString() > deadline.toString(), "Error: Deadline not expired");

    truffleAssert.passes(airdropInst.recoverERC20({from: accounts[0]}), "Token withdraw failed");
  });
});



function createLeaves(airdrop) { 
    var leaves = [];
    
    for(i = 0; i < airdrop.length; i++)
    {
        let hash = web3.utils.soliditySha3(airdrop[i]['to'], airdrop[i]['amount']);
        leaves.push(hash); 
    }

    return leaves.sort(); 
}

function getLeafAtIndex(index, airdrop) {
    if(index >= airdrop.length) return 0; // invalid index
    return web3.utils.soliditySha3(airdrop[index]['to'], airdrop[index]['amount']); 
}

function calculateMerkleRoot(_leaves) { 
    let nodes = [];
    
    for(i = 0; i<=_leaves.length / 2; i+=2)
    {
        let hash = web3.utils.soliditySha3(_leaves[i], _leaves[i+1]);
        nodes.push(hash); 
    }

    nodes = nodes.sort(); 
        
    if(nodes.length > 1) 
    {
        return calculateMerkleRoot(nodes); 
    } else {
        return nodes; 
    }
}

function calculateProof(leaf, leaves) { 
    let proof = [];
    let sortedIndex = leaves.indexOf(leaf); 
    let sibling, hash;

    while(leaves.length >= 2)
    { 
        if(sortedIndex % 2 == 0)
        {
            sibling = leaves[sortedIndex+1];
            hash = web3.utils.soliditySha3(leaf, sibling); 
        } else 
        {
            sibling = leaves[sortedIndex-1];
            hash = web3.utils.soliditySha3(sibling, leaf); 
        }

        proof.push(sibling);
        leaves = reduceMerkle(leaves);
        sortedIndex = leaves.indexOf(hash); 
    }
    
    return proof; 
}

function reduceMerkle(_leaves) {
    let nodes = [];
    
    for(i = 0; i<=_leaves.length / 2; i+=2)
    {
        let hash = web3.utils.soliditySha3(_leaves[i], _leaves[i+1]); nodes.push(hash);
    }
    
    return nodes.sort(); 
}

