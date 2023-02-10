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

    BridgeCheckNonce(destination: Network): Promise<boolean | null>;
    BridgeSendTx(destination: Network, amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<string | null>;
    BridgeCompleteTransfer(signature: string, sendingChain: string, amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<boolean>;

    FlipperAddFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void>;
    FlipperCheckFunds(): Promise<string | null>;
    FlipperFlipCoin(callback: (hash: string, tx: Web3Transaction) => void): Promise<void>;
    FlipperWithdrawFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void>;

    ReflectGetToken(amount: string): Promise<boolean>;
    ReflectGetPrice(): Promise<string | null>;
    ReflectBalance(address?: string): Promise<string | null>;
    ReflectTransfer(recipient: string, amount: string): Promise<boolean>;

    StakeAddFunds(amount: string): Promise<boolean>;
    StakeWithdrawFunds(amount: string): Promise<boolean>;
    StakeCheckStake(): Promise<string | null>;
    StakeCheckReward(): Promise<string | null>;
    StakeClaimReward(): Promise<boolean>;

    NFTMint(message: string): Promise<boolean>;
    NFTBalance(address?: string): Promise<string | null>;
    NFTGetOwner(tokenId: string): Promise<string | null>;
    NFTTransfer(recipient: string, tokenId: string): Promise<boolean>;
}