import { ethers } from 'hardhat';
import airdropRecipient from '../scripts/airdropData.json';

async function main() {

  //Deploy airdrop token with 1,000 initial supply
    let Airdrop = await ethers.getContractFactory("AirdropClaim");
    let airdrop = await Airdrop.deploy();
    await airdrop.deployed()
  
};

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
})

// function createLeaves(airdrop) { 
//   var leaves = [];
  
//   for(let i = 0; i < airdrop.length; i++)
//   {
//       let hash = web3.utils.soliditySha3(airdrop[i]['to'], airdrop[i]['amount']);
//       leaves.push(hash); 
//   }

//   return leaves.sort(); 
// }

// function getLeafAtIndex(index, airdrop) {
//   if(index >= airdrop.length) return 0; // invalid index
//   return web3.utils.soliditySha3(airdrop[index]['to'], airdrop[index]['amount']); 
// }

// function calculateMerkleRoot(_leaves) { 
//   let nodes = [];
  
//   for(i = 0; i<=_leaves.length / 2; i+=2)
//   {
//       let hash = web3.utils.soliditySha3(_leaves[i], _leaves[i+1]);
//       nodes.push(hash); 
//   }

//   nodes = nodes.sort(); 
      
//   if(nodes.length > 1) 
//   {
//       return calculateMerkleRoot(nodes); 
//   } else {
//       return nodes; 
//   }
// }

// function calculateProof(leaf, leaves) { 
//   let proof = [];
//   let sortedIndex = leaves.indexOf(leaf); 
//   let sibling, hash;

//   while(leaves.length >= 2)
//   { 
//       if(sortedIndex % 2 == 0)
//       {
//           sibling = leaves[sortedIndex+1];
//           hash = web3.utils.soliditySha3(leaf, sibling); 
//       } else 
//       {
//           sibling = leaves[sortedIndex-1];
//           hash = web3.utils.soliditySha3(sibling, leaf); 
//       }

//       proof.push(sibling);
//       leaves = reduceMerkle(leaves);
//       sortedIndex = leaves.indexOf(hash); 
//   }
  
//   return proof; 
// }

// function reduceMerkle(_leaves) {
//   let nodes = [];
  
//   for(i = 0; i<=_leaves.length / 2; i+=2)
//   {
//       let hash = web3.utils.soliditySha3(_leaves[i], _leaves[i+1]); nodes.push(hash);
//   }
  
//   return nodes.sort(); 
// }
