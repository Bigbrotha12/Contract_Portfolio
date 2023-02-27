import { ContractTransaction } from "ethers";
import { Network, Web3Transaction, NetworkName } from "./Definitions";
import { Error } from "./Errors";

export default interface IController
{
    ConnectionStatus(): boolean;                 
    RequestConnection(): Promise<[Error | null, string | null]>;
    CreateWallet(): [Error | null, {address: string, mnemonic: string} | null];
    GetWalletAddress(mnemonic: string): [Error | null, string | null];
    GetNetwork(): Promise<[Error | null, Network | null]>;
    ChangeNetwork(network: Network, mnemonic?: string): Promise<[Error | null]>;
    GetGasBalance(mnemonic?: string, network?: NetworkName): Promise<[Error | null, string | null]>;
    
    GetTestTokens(callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>
    GetTestTokenBalance(address?: string, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null, string | null]>
    
    AirdropNewRecipients(recipients: Array<{ to: string, amount: string }>, callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>;  
    AirdropClaim(creator: string, address: string, amount: string, data: { to: string; amount: string; }[], callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>;
    AirdropHasClaimed(address: string, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null, boolean | null]>; 

    BridgeSendTx(destination: number, amount: string, callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>;
    BridgeCompleteTransfer(sendingChain: number, nonce: string, callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>;
    BridgeGetPending(name: NetworkName, rpc: string, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null, string | null]>;

    FlipperAddFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>;
    FlipperFlipCoin(callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>;
    FlipperWithdrawFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>;
    FlipperCheckFunds(mnemonic?: string, networkName?: NetworkName): Promise<[Error | null, string | null]>;

    ReflectGetToken(amount: string, callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>;
    ReflectTransfer(recipient: string, amount: string, callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>;
    ReflectGetPrice(mnemonic?: string, networkName?: NetworkName): Promise<[Error | null, string | null]>;
    ReflectBalance(address?: string, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null, string | null]>;

    StakeAddFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>;
    StakeWithdrawFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>;
    StakeClaimReward(callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>;
    StakeCheckStake(mnemonic?: string, networkName?: NetworkName): Promise<[Error | null, string | null]>;
    StakeCheckReward(mnemonic?: string, networkName?: NetworkName): Promise<[Error | null, string | null]>;

    NFTMint(message: string, callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>;
    NFTTransfer(recipient: string, tokenId: string, callback: (hash: string, tx: Web3Transaction) => void, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null]>;
    NFTBalance(address?: string, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null, string | null]>;
    NFTGetOwner(tokenId: string, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null, string | null]>;
    NFTGetMetadata(tokenId: string, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null, { url: string, message: string } | null]>;
    NFTFetchAll(address?: string, mnemonic?: string, networkName?: NetworkName): Promise<[Error | null, Array<string> | null]>;
}