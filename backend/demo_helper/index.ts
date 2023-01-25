import { ethers } from "ethers";
import { abi } from "./contractABI.json";

exports.handler = async (event) => {
    // Receive message to check with [transaction hash], and [sendingChainId] network to process bridge transaction.
    let { txHash, chainId } = validateInputs(event.queryStringParameters);
    if (!txHash || !chainId) {
        return { statusCode: 400, headers: {}, body: 'Invalid input parameters.' };
    }

    // Obtain contract event args
    let args: { receiver: string, chain: number, amount: number, nonce: number, domain: string } | null = null; 
    let contract: ethers.Contract | null = getContractInstance(chainId);
    if (!contract) {
        return { statusCode: 400, headers: {}, body: 'Invalid chain ID parameter.' };
    }
    let filter: ethers.EventFilter = contract.filters.DataSent(txHash.from);
    let blockEvent = await contract.queryFilter(filter, txHash.blockHash);
    if (blockEvent) {
        let result = blockEvent.pop()?.args;
        if (result) {
            args = {
                receiver: result[0],
                amount: result[1],
                chain: result[2],
                nonce: result[3],
                domain: result[4]
            }
        } 
    }
    if (!args) {
        return { statusCode: 400, headers: {}, body: 'Unable to verify event.' };
    }
    
    // Verify matching nonce on receiving chain, otherwise revert.
    let destContract: ethers.Contract | null = getContractInstance(args.chain);
    if (!destContract) {
        return { statusCode: 400, headers: {}, body: 'Invalid destination chain.' };
    }
    let destNonce = await destContract.nonce(args.receiver, chainId, args.chain);
    if (destNonce != args.nonce) {
        return { statusCode: 400, headers: {}, body: 'Nonce mismatch.' };
    }
    
    // Build message hash using domainHash and built structHash
    let domainSeparator = args.domain;
    let structSeparator = structHash(args.receiver, args.chain, args.amount, args.nonce);
    let msg = ethers.utils.solidityKeccak256(["string", "bytes32", "bytes32"], ["\x19\x01", domainSeparator, structSeparator]);
    
    // Sign message and return to client.
    let signer: ethers.Signer = new ethers.Wallet(process.env.PRIV_KEY!);
    let signature = await signer.signMessage(ethers.utils.arrayify(msg));
    return { statusCode: 200, headers: {}, body: JSON.stringify({ signature: signature }) };
};

function validateInputs(queryString) {
    // Validate Transaction Hash,  and chain ID
    let { txHash, chainId } = queryString;
    if (/^0x([A-Fa-f0-9]{64})$/.test(txHash) && /[0-9]*/.test(chainId)) {
        return { txHash, chainId };
    } else {
        return { txHash: null, chainId: null };
    }
}

function getContractInstance(chainId: number): ethers.Contract | null {
    let provider: ethers.providers.JsonRpcProvider;
    switch (chainId) {
        // Goerli
        case 5:
            provider = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");
            return new ethers.Contract("address", abi, provider);
        // BinanceTest
        case 97:
            provider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
            return new ethers.Contract("address", abi, provider);
        // PolygonTest
        case 80001:
            provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
            return new ethers.Contract("address", abi, provider);
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