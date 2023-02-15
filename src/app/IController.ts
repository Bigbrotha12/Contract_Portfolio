import { ContractTransaction } from "ethers";
import { Network, Contract, TransactionStatus, Web3Transaction, NetworkName } from "./Definitions";

export default interface IController
{
    ConnectionStatus(): boolean;                 // Returns whether or not user wallet is unlocked.
    RequestConnection(): Promise<string | null>; // Request user unlock wallet and creates signer.
    GetNetwork(): Promise<Network | null>;
    ChangeNetwork(network: Network): Promise<boolean>;
    onTransactionStatusChange(transaction: ContractTransaction, network: NetworkName, callback: (hash: string, tx: Web3Transaction) => void): Promise<void>

    GetTestTokens(): Promise<boolean>
    GetTestTokenBalance(address?: string): Promise<string | null>
    
    AirdropNewRecipients(recipients: Array<{ to: string, amount: string }>, callback: (hash: string, tx: Web3Transaction) => void): Promise<void>;  // Generates new root and saves to browser.
    AirdropClaim(creator: string, address: string, amount: string, data: { to: string; amount: string; }[], callback: (hash: string, tx: Web3Transaction) => void): Promise<void>;     // Generates proof and sends claim transaction.
    AirdropCheckClaim(address: string, data: { to: string; amount: string; }[]): number | null; // Returns amount claimable by address.
    AirdropHasClaimed(address: string): Promise<boolean | null>; 

    BridgeGetPending(destination: number, name: string, rpc: string): Promise<string | null>;
    BridgeSendTx(destination: number, amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void>;
    BridgeCompleteTransfer(sendingChain: number, nonce: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void>;

    FlipperAddFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void>;
    FlipperCheckFunds(): Promise<string | null>;
    FlipperFlipCoin(callback: (hash: string, tx: Web3Transaction) => void): Promise<void>;
    FlipperWithdrawFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void>;

    ReflectGetToken(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<boolean>;
    ReflectGetPrice(): Promise<string | null>;
    ReflectBalance(address?: string): Promise<string | null>;
    ReflectTransfer(recipient: string, amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<boolean>;

    StakeAddFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<boolean>;
    StakeWithdrawFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<boolean>;
    StakeCheckStake(): Promise<string | null>;
    StakeCheckReward(): Promise<string | null>;
    StakeClaimReward(callback: (hash: string, tx: Web3Transaction) => void): Promise<boolean>;

    NFTMint(message: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<boolean>;
    NFTBalance(address?: string): Promise<string | null>;
    NFTGetOwner(tokenId: string): Promise<string | null>;
    NFTGetMetadata(tokenId: string): Promise<{ url: string, message: string } | null>;
    NFTFetchAll(address?: string): Promise<Array<string> | null>;
    NFTTransfer(recipient: string, tokenId: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<boolean>;
}