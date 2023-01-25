import { Network, Contract, TransactionStatus } from "./Definitions";

export default interface IController
{
    ConnectionStatus(): boolean;                 // Returns whether or not user wallet is unlocked.
    RequestConnection(): Promise<string | null>; // Request user unlock wallet and creates signer.
    GetNetwork(): Promise<Network | null>;
    ChangeNetwork(network: Network): Promise<boolean>;
    GetTestTokens(amount: number): Promise<boolean>;    // Request test ERC20 tokens from contract.
    AddTransactionListener(callback: (status: TransactionStatus, hash: string) => void): boolean;
    RemoveTransactionListener(): boolean;
    Subscribe(contract: Contract, event: string, callback: (event) => Promise<boolean>);
    Unsubscribe(contract: Contract, event: string, callback: (event) => boolean);
    
    AirdropNewRecipients(recipients: Array<{ to: string, amount: string }>): Promise<boolean>;  // Generates new root and saves to browser.
    AirdropClaim(address: string, amount: string, data: { to: string; amount: string; }[]): Promise<boolean>;     // Generates proof and sends claim transaction.
    AirdropCheckClaim(address: string, data: { to: string; amount: string; }[]): number | null; // Returns amount claimable by address.
    AirdropHasClaimed(address: string): Promise<boolean | null>; 

    BridgeSendTx(destination: Network, amount: string): Promise<string | null>;
    BridgePendingTransaction(sendingChain: Network, receivingChain: Network): Promise<boolean>;
    BridgeCompleteTransfer(signature: string, sendingChain: string, amount: string): Promise<boolean>;

    FlipperAddFunds(amount: string): Promise<boolean>;
    FlipperCheckFunds(): Promise<string | null>;
    FlipperFlipCoin(): Promise<boolean>;
    FlipperWithdrawFunds(amount: string): Promise<boolean>;

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