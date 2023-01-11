import IController from "./IController";
import { Network, Contract } from "../components/00_Common/Definitions";
import { Networks, Contracts } from "../components/00_Common/Networks";
import { ethers } from 'ethers';

export default class AppController implements IController
{
    ConnectionStatus(): boolean {
        return (window as any).ethereum?.isConnected() ? true : false;
    }

    async RequestConnection(): Promise<string | null>  {
        
        let provider = (window as any).ethereum;
        if (provider)
        {
            try
            {
                let userAccount = await provider.request({ method: 'eth_requestAccounts' });
                
                return userAccount[0];
            } catch (error)
            {
                if (error.code === 4001) { console.log("Request rejected by user."); }
                else { console.log("Internal Error."); }
            }  
        }
        return null;
    }

    async GetNetwork(): Promise<Network>
    {
        let provider = (window as any).ethereum;
        if (provider)
        {
            try
            {
                let id = await provider.request({ method: 'eth_chainId' });
                for (let i = 0; i < Networks.length; i++)
                {
                    if (id === Networks[i].hexID)
                    {
                        return Networks[i];  
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        return Networks[0];  
    }

    async ChangeNetwork(network: Network): Promise<boolean>
    {
        let provider = (window as any).ethereum;
        if (provider) {
            try {
                await provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: network.hexID }],
                });
                return true;
            } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                    try {
                        await provider.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: network.hexID,
                                    chainName: network.name,
                                    rpcUrls: [network.rpcUrl],
                                },
                            ],
                        });
                        return true;
                    } catch (addError) {
                        // handle "add" error
                        console.log("Unable to add blockchain network.");
                    }
                }
            }
        }
        return false;  
    }

    #InstantiateContracts(contract: Contract, network: Network)
    {
        
    }

    GetTestTokens(amount: number): void {
        throw new Error("Method not implemented.");
    }
    AirdropNewRecipients(recipients: { address: string; amount: number; }[]): boolean {
        throw new Error("Method not implemented.");
    }
    AirdropClaim(address: string): boolean {
        throw new Error("Method not implemented.");
    }
    AirdropCheckClaim(address: string): number {
        throw new Error("Method not implemented.");
    }
    BridgeTransferTo(destination: Network, amount: number): void {
        throw new Error("Method not implemented.");
    }
    FlipperAddFunds(amount: number): void {
        throw new Error("Method not implemented.");
    }
    FlipperCheckFunds(address: string): number {
        throw new Error("Method not implemented.");
    }
    FlipperFlipCoin(): void {
        throw new Error("Method not implemented.");
    }
    FlipperWithdrawFunds(): void {
        throw new Error("Method not implemented.");
    }
    ReflectGetToken(amount: number): void {
        throw new Error("Method not implemented.");
    }
    ReflectApprove(address: string, amount: number): void {
        throw new Error("Method not implemented.");
    }
    ReflectBalance(address: string): number {
        throw new Error("Method not implemented.");
    }
    ReflectTransfer(recipient: string, amount: number): void {
        throw new Error("Method not implemented.");
    }
    StakeAddFunds(amount: number): void {
        throw new Error("Method not implemented.");
    }
    StakeWithdrawFunds(): void {
        throw new Error("Method not implemented.");
    }
    StakeCheckStake(address: string): number {
        throw new Error("Method not implemented.");
    }
    StakeCheckReward(address: string): number {
        throw new Error("Method not implemented.");
    }
    StakeClaimReward(): void {
        throw new Error("Method not implemented.");
    }
    NFTMint(): void {
        throw new Error("Method not implemented.");
    }
    NFTBalance(address: string): number {
        throw new Error("Method not implemented.");
    }
    NFTGetOwner(tokenId: number): string {
        throw new Error("Method not implemented.");
    }
    NFTTransfer(recipient: string, tokenId: number): void {
        throw new Error("Method not implemented.");
    }

}