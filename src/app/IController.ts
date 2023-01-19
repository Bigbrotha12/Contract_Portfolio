import { Network, Contract } from "../components/00_Common/Definitions";

export default interface IController
{
    ConnectionStatus(): boolean;                                // Returns whether or not user wallet is unlocked.
    RequestConnection(): Promise<string | null>; // Request user unlock wallet and creates signer.
    GetNetwork(): Promise<Network>;
    ChangeNetwork(network: Network): Promise<boolean>;
    GetTestTokens(amount: number): void;    // Request test ERC20 tokens from contract.
    
    AirdropNewRecipients(recipients: Array<{ to: string, amount: string }>): boolean;  // Generates new root and saves to browser.
    AirdropClaim(address: string, amount: string): boolean;     // Generates proof and sends claim transaction.
    AirdropCheckClaim(address: string): number; // Returns amount claimable by address.

    BridgeTransferTo(destination: Network, amount: number): void;

    FlipperAddFunds(amount: number): void;
    FlipperCheckFunds(address: string): number;
    FlipperFlipCoin(): void;
    FlipperWithdrawFunds(): void;

    ReflectGetToken(amount: number): void;
    ReflectApprove(address: string, amount: number): void;
    ReflectBalance(address: string): number;
    ReflectTransfer(recipient: string, amount: number): void;

    StakeAddFunds(amount: number): void;
    StakeWithdrawFunds(): void;
    StakeCheckStake(address: string): number;
    StakeCheckReward(address: string): number;
    StakeClaimReward(): void;

    NFTMint(address: string): void;
    NFTBalance(address: string): number;
    NFTGetOwner(tokenId: number): string;
    NFTTransfer(recipient: string, tokenId: number): void;
}