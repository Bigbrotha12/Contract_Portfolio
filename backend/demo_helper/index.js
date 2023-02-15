const ethers = require("ethers");
const { abi } = require("./contractABI.json");

exports.handler = async (event) => {
    // Receive message to check with [receiver], [nonce], and [sendingChainId] network to process bridge transaction.
    let { receiver, nonce, chainId } = validateInputs(event.queryStringParameters);
    if (!receiver || !nonce || !chainId) {
        return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: 'Invalid input parameters.' };
    }

    // Obtain contract event args
    let args = null; 
    let { contract, block } = await getContractInstance(chainId);
    if (!contract || !block) {
        return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: 'Invalid chain ID parameter.' };
    }
    let filter = contract.filters.DataSent(receiver);
    let fromBlock = block - 1000;
    let blockEvent;
    try {
        blockEvent = await contract.queryFilter(filter, fromBlock);
    } catch (error) {
        console.error(error);
    }
    if (blockEvent) {
        // Search for matching nonce
        let result = blockEvent.filter((event) => {
            return event.args[3].toString() == nonce;
        }).pop();
        if (result) {
            args = {
                receiver: result.args[0],
                amount: result.args[1].toString(),
                chain: result.args[2].toString(),
                nonce: result.args[3].toString(),
                domain: result.args[4]
            }
        } 
    }
    if (!args) {
        return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: 'Unable to verify event.' };
    }
    
    // Build message hash using domainHash and built structHash
    let domainSeparator = await contract.getDomainHash(args.chain);
    let structSeparator = structHash(args.receiver, args.chain, args.amount, args.nonce);
    let msg = ethers.utils.solidityKeccak256(["string", "bytes32", "bytes32"], ["\x19\x01", domainSeparator, structSeparator]);
    
    // Sign message and return to client.
    let signer = new ethers.Wallet(process.env.PRIV_KEY);
    let signature = await signer.signMessage(ethers.utils.arrayify(msg));
    return {
        statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({
            amount: args.amount,
            signature: signature
        })
    };
};

function validateInputs(queryString) {
    // Validate Transaction Hash,  and chain ID
    let { receiver, nonce, chainId } = queryString;
    if (/^0x([A-Fa-f0-9]{40})$/.test(receiver) && /[0-9]*/.test(nonce) && /[0-9]*/.test(chainId)) {
        return { receiver, nonce, chainId };
    } else {
        return { receiver: '', nonce: '', chainId: '' };
    }
}

async function getContractInstance(chainId) {
    let provider, blockNum;
    switch (chainId) {
        // Goerli
        case '5':
            provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_RPC);
            try { blockNum = await provider.getBlockNumber(); } catch (error) { console.error(error); }
            return { contract: new ethers.Contract(process.env.GOERLI_CONTRACT, abi, provider), block: blockNum };
        // BinanceTest
        case '97':
            provider = new ethers.providers.JsonRpcProvider(process.env.BNB_TESTNET_RPC);
            try { blockNum = await provider.getBlockNumber(); } catch (error) { console.error(error); }
            return { contract: new ethers.Contract(process.env.BNB_CONTRACT, abi, provider), block: blockNum };
        // PolygonTest
        case '80001':
            provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_TESTNET_RPC);
            try { blockNum = await provider.getBlockNumber(); } catch (error) { console.error(error); }
            return { contract: new ethers.Contract(process.env.POLYGON_CONTRACT, abi, provider), block: blockNum };
        default:
            return null;
    }
}

function structHash(_recipient, _chainId, _amount, _nonce) {
    // structSeparator
    let structTypeHash = ethers.utils.solidityKeccak256(["string"], ["Transaction(address receiver,uint256 receivingChainId,uint256 amount, uint256 nonce)"]);
    let structReceiver = _recipient;
    let structChainId = _chainId; 
    let structAmount = _amount;
    let structNonce = _nonce;     
    let encodedStruct = ethers.utils.defaultAbiCoder.encode(
      ['bytes32', 'address', 'uint256', 'uint256', 'uint256'],
      [structTypeHash, structReceiver, structChainId, structAmount, structNonce]);
    return ethers.utils.solidityKeccak256(["bytes"], [encodedStruct]);
}