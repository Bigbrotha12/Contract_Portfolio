import { Network, Contract } from "../components/00_Common/Definitions";

export default interface IController
{
    ConnectionStatus(): boolean;                                // Returns whether or not user wallet is unlocked.
    RequestConnection(): Promise<string | null>; // Request user unlock wallet and creates signer.
    GetNetwork(): Promise<Network>;
    ChangeNetwork(network: Network): Promise<boolean>;
    GetTestTokens(amount: number): void;    // Request test ERC20 tokens from contract.
    Subscribe(contract: Contract, event: string, callback: (event) => void);
    Unsubscribe(contract: Contract, event: string, callback: (event) => void);
    
    AirdropNewRecipients(recipients: Array<{ to: string, amount: string }>): boolean;  // Generates new root and saves to browser.
    AirdropClaim(address: string, amount: string): boolean;     // Generates proof and sends claim transaction.
    AirdropCheckClaim(address: string): number; // Returns amount claimable by address.
    AirdropHasClaimed(address: string): boolean 

    BridgeTransferTo(destination: Network, amount: number): void;

    FlipperAddFunds(amount: number): void;
    FlipperCheckFunds(): number;
    FlipperFlipCoin(): void;
    FlipperWithdrawFunds(): void;

    ReflectGetToken(amount: number): void;
    ReflectGetPrice(): number;
    ReflectApprove(address: string, amount: number): void;
    ReflectBalance(address?: string): number;
    ReflectTransfer(recipient: string, amount: number): void;

    StakeAddFunds(amount: number): void;
    StakeWithdrawFunds(): void;
    StakeCheckStake(): number;
    StakeCheckReward(): number;
    StakeClaimReward(): void;

    NFTMint(): void;
    NFTBalance(address?: string): number;
    NFTGetOwner(tokenId: number): string;
    NFTTransfer(recipient: string, tokenId: number): void;
}