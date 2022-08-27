const AirdropRecipients = require("./airdropData.json");
const Web3 = require("web3-utils");

function createLeaves(airdrop) { 
    var leaves = [];
    
    for(i = 0; i < airdrop.length; i++)
    {
        let hash = Web3.soliditySha3(airdrop[i]['to'], airdrop[i]['amount']);
        leaves.push(hash); 
    }

    return leaves.sort(); 
}

// console.log(createLeaves(AirdropRecipients.airdropRecipient));

function calculateMerkleRoot(_leaves) { 
    let nodes = [];
    
    for(i = 0; i<=_leaves.length / 2; i+=2)
    {
        let hash = Web3.soliditySha3(_leaves[i], _leaves[i+1]);
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

// let leaves = createLeaves(AirdropRecipients.airdropRecipient); 
// console.log(calculateMerkleRoot(leaves));

function getLeafAtIndex(index, airdrop) {
    if(index >= airdrop.length) return 0; // invalid index
    return Web3.soliditySha3(airdrop[index]['to'], airdrop[index]['amount']); 
}

function reduceMerkle(_leaves) {
    let nodes = [];
    
    for(i = 0; i<=_leaves.length / 2; i+=2)
    {
        let hash = Web3.soliditySha3(_leaves[i], _leaves[i+1]); nodes.push(hash);
    }
    
    return nodes.sort(); 
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
            hash = Web3.soliditySha3(leaf, sibling); 
        } else 
        {
            sibling = leaves[sortedIndex-1];
            hash = Web3.soliditySha3(sibling, leaf); 
        }

        proof.push(sibling);
        leaves = reduceMerkle(leaves);
        sortedIndex = leaves.indexOf(hash); 
    }
    
    return proof; 
}

// let leaves = createLeaves(AirdropRecipients.airdropRecipient); 
// let leaf = getLeafAtIndex(2, AirdropRecipients.airdropRecipient); 
/// console.log(calculateProof(leaf, leaves));
