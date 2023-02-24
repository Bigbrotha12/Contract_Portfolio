import { ContractTransaction } from "ethers";
import { Network, Web3Transaction, NetworkName } from "./Definitions";
import { Error } from "./Errors";

export default interface IController
{
    ConnectionStatus(): boolean;                 
    RequestConnection(): Promise<[Error | null, string | null]>;
    GetNetwork(): Promise<[Error | null, Network | null]>;
    ChangeNetwork(network: Network): Promise<[Error | null]>;
    
    GetTestTokens(callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>
    GetTestTokenBalance(address?: string): Promise<[Error | null, string | null]>
    
    AirdropNewRecipients(recipients: Array<{ to: string, amount: string }>, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>;  
    AirdropClaim(creator: string, address: string, amount: string, data: { to: string; amount: string; }[], callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>;
    AirdropHasClaimed(address: string): Promise<[Error | null, boolean | null]>; 

    BridgeSendTx(destination: number, amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>;
    BridgeCompleteTransfer(sendingChain: number, nonce: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>;
    BridgeGetPending(name: NetworkName, rpc: string): Promise<[Error | null, string | null]>;

    FlipperAddFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>;
    FlipperFlipCoin(callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>;
    FlipperWithdrawFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>;
    FlipperCheckFunds(): Promise<[Error | null, string | null]>;

    ReflectGetToken(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>;
    ReflectTransfer(recipient: string, amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>;
    ReflectGetPrice(): Promise<[Error | null, string | null]>;
    ReflectBalance(address?: string): Promise<[Error | null, string | null]>;

    StakeAddFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>;
    StakeWithdrawFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>;
    StakeClaimReward(callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>;
    StakeCheckStake(): Promise<[Error | null, string | null]>;
    StakeCheckReward(): Promise<[Error | null, string | null]>;

    NFTMint(message: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>;
    NFTTransfer(recipient: string, tokenId: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]>;
    NFTBalance(address?: string): Promise<[Error | null, string | null]>;
    NFTGetOwner(tokenId: string): Promise<[Error | null, string | null]>;
    NFTGetMetadata(tokenId: string): Promise<[Error | null, { url: string, message: string } | null]>;
    NFTFetchAll(address?: string): Promise<[Error | null, Array<string> | null]>;
}