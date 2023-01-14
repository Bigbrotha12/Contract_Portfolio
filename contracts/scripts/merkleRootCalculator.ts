import { ethers } from "ethers";

function createLeaves(airdrop: RecipientList): Array<string> { 
    var leaves: Array<string> = [];
    
    for(let i = 0; i < airdrop.length; i++)
    {
        let packed: string = ethers.utils.solidityKeccak256(["address", "uint256"], [airdrop[i]['to'], airdrop[i]['amount']]);
        
        leaves.push(packed); 
    }

    return leaves.sort(); 
}

function getLeafAtIndex(index: number, airdrop: RecipientList): string {
    if (index >= airdrop.length) return ""; // invalid index
    let packed: string = ethers.utils.solidityKeccak256(["address", "uint256"], [airdrop[index]['to'], airdrop[index]['amount']]);
    return packed; 
}

function calculateMerkleRoot(_leaves: Array<string>): string { 
    let nodes: Array<string> = [];
    
    for(let i = 0; i<=_leaves.length / 2; i+=2)
    {
        let hash: string = ethers.utils.solidityKeccak256(["bytes32", "bytes32"], [_leaves[i], _leaves[i+1]]);
        nodes.push(hash); 
    }

    nodes = nodes.sort(); 
        
    if(nodes.length > 1) 
    {
        return calculateMerkleRoot(nodes); 
    } else if(nodes.length > 0) {
        return nodes[0]; 
    } else
    {
        return "";    
    }
}

function calculateProof(leaf: string, leaves: Array<string>): Array<string> { 
    let proof: Array<string> = [];
    let sortedIndex: number = leaves.indexOf(leaf); 
    let sibling: string, hash: string;

    while(leaves.length >= 2)
    { 
        if(sortedIndex % 2 == 0)
        {
            sibling = leaves[sortedIndex+1];
            hash = ethers.utils.solidityKeccak256(["bytes32", "bytes32"], [leaf, sibling]); 
        } else 
        {
            sibling = leaves[sortedIndex-1];
            hash = ethers.utils.solidityKeccak256(["bytes32", "bytes32"], [sibling, leaf]); 
        }

        proof.push(sibling);
        leaves = reduceMerkle(leaves);
        sortedIndex = leaves.indexOf(hash); 
    }
    
    return proof; 
}

function reduceMerkle(_leaves: Array<string>): Array<string> {
    let nodes: Array<string> = [];
    
    for(let i = 0; i<=_leaves.length / 2; i+=2)
    {
        let hash: string = ethers.utils.solidityKeccak256(["bytes32", "bytes32"], [_leaves[i], _leaves[i + 1]]);
        nodes.push(hash);
    }
    
    return nodes.sort(); 
}

export default {
    calculateProof,
    calculateMerkleRoot,
    createLeaves,
    getLeafAtIndex
}

type RecipientList = Array<{to: string, amount: string}>



