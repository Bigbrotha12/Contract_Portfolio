import { ContractTransaction } from "ethers";
import { Network, Web3Transaction, NetworkName } from "./Definitions";
import { Error } from "./Errors";

export default interface IController
{
    ConnectionStatus(): boolean;                 // Returns whether or not user wallet is unlocked.
    RequestConnection(): Promise<string | Error>; // Request user unlock wallet and creates signer.
    GetNetwork(): Promise<Network | Error>;
    ChangeNetwork(network: Network): Promise<void | Error>;
    
    GetTestTokens(callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>
    GetTestTokenBalance(address?: string): Promise<string | Error>
    
    AirdropNewRecipients(recipients: Array<{ to: string, amount: string }>, callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>;  // Generates new root and saves to browser.
    AirdropClaim(creator: string, address: string, amount: string, data: { to: string; amount: string; }[], callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>;     // Generates proof and sends claim transaction.
    AirdropHasClaimed(address: string): Promise<boolean | Error>; 

    BridgeSendTx(destination: number, amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>;
    BridgeCompleteTransfer(sendingChain: number, nonce: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>;
    BridgeGetPending(name: NetworkName, rpc: string): Promise<string | Error>;

    FlipperAddFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>;
    FlipperFlipCoin(callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>;
    FlipperWithdrawFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>;
    FlipperCheckFunds(): Promise<string | Error>;

    ReflectGetToken(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>;
    ReflectTransfer(recipient: string, amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>;
    ReflectGetPrice(): Promise<string | Error>;
    ReflectBalance(address?: string): Promise<string | Error>;

    StakeAddFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>;
    StakeWithdrawFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>;
    StakeClaimReward(callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>;
    StakeCheckStake(): Promise<string | Error>;
    StakeCheckReward(): Promise<string | Error>;

    NFTMint(message: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>;
    NFTTransfer(recipient: string, tokenId: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void | Error>;
    NFTBalance(address?: string): Promise<string | Error>;
    NFTGetOwner(tokenId: string): Promise<string | Error>;
    NFTGetMetadata(tokenId: string): Promise<{ url: string, message: string } | Error>;
    NFTFetchAll(address?: string): Promise<Array<string> | Error>;
}