const AirdropClaim = artifacts.require("AirdropClaim");
const AirdropToken = artifacts.require("AirdropToken");
const airdropRecipient = require('../scripts/airdropData.json');

module.exports = async function (deployer) {
  let leaves = createLeaves(airdropRecipient.airdropRecipient);
  let merkleRoot = calculateMerkleRoot(leaves);
  let deadline = 10 // Airdrop will be active for 10 blocks
  let tokenAddr;

  //Deploy airdrop token with 1,000 initial supply
  await deployer.deploy(AirdropToken, "AirCoin", "ARC", 1000);
  let token = await AirdropToken.deployed();
  tokenAddr = token.address;

  await deployer.deploy(AirdropClaim, merkleRoot[0], tokenAddr, deadline);
  
};

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
