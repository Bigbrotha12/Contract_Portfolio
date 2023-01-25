import IController from "./IController";
import { Network, Contract, TransactionStatus, WalletEvent, ContractName } from "./Definitions";
import { Networks, Contracts } from "./Networks";
import { ethers } from 'ethers';
import Merkle from "../../contracts/scripts/merkleRootCalculator";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { DemoToken } from '../../contracts/typechain-types/contracts/A_DemoToken';
import { AirdropDemo } from '../../contracts/typechain-types/contracts/B_Airdrop/AirdropDemo';
import { IBC_Bridge } from "../../contracts/typechain-types/contracts/C_IBC_Messenger/IBC_Bridge";
import { ReflectToken } from "../../contracts/typechain-types/contracts/D_Reflect_Token";
import { Staker } from '../../contracts/typechain-types/contracts/E_Staker';
import { FamiliarLogic as NFTDemo } from '../../contracts/typechain-types/contracts/F_Upgradable_NFT';
import { CoinFlipper } from '../../contracts/typechain-types/contracts/G_Oracle_Contract';

declare global {
    interface Window {
        ethereum: MetaMaskInpageProvider;
    }
}

export default class AppController implements IController
{
    web3Provider: ethers.providers.JsonRpcProvider;
    signer: ethers.Signer;
    contractInstances: Map<string, ethers.Contract> = new Map<string, ethers.Contract>();
    txListener: ((status: TransactionStatus, hash: string) => void) | null;
    connectionListener: ((action: WalletEvent, account: string, network: string) => void) | null;
    signerAPI: string = "";
    cachedNFT: Map<number, Array<string>>;

    // Core
    ConnectionStatus(): boolean {
        return window.ethereum?.isConnected();
    }

    async RequestConnection(): Promise<string | null>  {
        
        let provider = window.ethereum;
        if (provider)
        {
            this.web3Provider = new ethers.providers.Web3Provider(provider as any);
            try
            {
                await this.web3Provider.send('eth_requestAccounts', []);
                this.signer = this.web3Provider.getSigner();
                return await this.signer.getAddress();
            } catch (error)
            {
                if (error.code === 4001) { console.log("Request rejected by user."); }
                else { console.log("Internal Error."); }
            }  
        }
        return null;
    }

    async GetNetwork(): Promise<Network | null>
    {
        if (this.web3Provider)
        {
            try
            {
                let id: number = await this.web3Provider.send('eth_chainId', []);
                console.log("Received ID: ", id);
                for (let i = 0; i < Networks.length; i++)
                {
                    if (id === Networks[i].id)
                    {
                        return Networks[i];  
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        return null;  
    }

    async ChangeNetwork(network: Network): Promise<boolean>
    {
        if (this.web3Provider) {
            try {
                await this.web3Provider.send(
                    'wallet_switchEthereumChain',
                    [{ chainId: network.hexID }],
                );
                return true;
            } catch (switchingError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchingError.code === 4902) {
                    try {
                        await this.web3Provider.send(
                            'wallet_addEthereumChain',
                            [
                                {
                                    chainId: network.hexID,
                                    chainName: network.name,
                                    rpcUrls: [network.rpcUrl],
                                }
                            ],
                        );
                        return true;
                    } catch (addingError) {
                        // handle "add" error
                        console.log("Unable to add blockchain network.");
                    }
                }
            }
        }
        return false;  
    }

    async Subscribe(contract: Contract, event: string, callback: (event: any) => Promise<boolean>) {
        let currentChain = await this.GetNetwork();
        if (currentChain) {
            console.log("Subscribing to: " + event + " on contract: " + contract.name);
            let instance = this.getContract(contract, currentChain);
            if (instance) {
                instance.on(event, callback);
                return true;
            }
        } else {
            return false;
        }
    }

    Unsubscribe(contract: Contract, event: string, callback: (event: any) => void): boolean {
        let cachedInstance = this.contractInstances.get(contract.name);
        if (cachedInstance) {
            console.log("Unsubscribing from: " + event + " on contract: " + contract.name);
            cachedInstance.off(event, callback);
            return true;
        }
        return false;
    }

    AddTransactionListener(callback: (status: TransactionStatus, hash: string) => void): boolean {
        this.txListener = callback;
        return true;
    }

    RemoveTransactionListener(): boolean {
        this.txListener = null;
        return true;
    }

    AddConnectionListener(callback: (action: WalletEvent, account: string, network: string) => void): boolean {
        this.connectionListener = callback;
        return true;
    }

    RemoveConnectionListener(): boolean {
        this.connectionListener = null;
        return true;
    }

    getContract(contract: Contract, network: Network): ethers.Contract | null
    {
        if (!this.signer) { return null; }
        let cachedInstance = this.contractInstances.get(network.name + contract.name);
        if (cachedInstance) {
            return cachedInstance;
        } else {
            let contractData = contract.instances.find(instance => network.name === instance.network);
            if (contractData) {
                let instance = new ethers.Contract(contractData.address, contract.abi, this.signer);
                this.contractInstances.set(network.name + contract.name, instance);
                return instance;
            }   
        }
        return null;
    }

    //---------------------- Demo Token -----------------
    async GetTestTokens(): Promise<boolean> {
        let network: Network | null = await this.GetNetwork();
        if (!network) return false;

        let contract: ethers.Contract | null = this.getContract(Contracts.get("Token")!, network);
        if (contract) {
            await (contract as DemoToken).faucet();
            return true;
        }
        return false;
    }

    //---------------------- Airdrop Demo ---------------
    StoreAirdropData(data) {
        try {
            localStorage.setItem("AirdropData", data);
        } catch (error) {
            console.error("Storage failed.");
        } 
    }

    FetchAirdropData() {
        return localStorage.getItem("AirdropData");
    }

    async AirdropNewRecipients(recipients: { to: string; amount: string; }[]): Promise<boolean> {
        let network: Network | null = await this.GetNetwork();
        if (!network) return false;

        let root = Merkle.calculateMerkleRoot(Merkle.createLeaves(recipients));
        let contract: ethers.Contract | null = this.getContract(Contracts.get("AirdropDemo")!, network)
        if (contract) {
            await (contract as AirdropDemo).createAirdrop(root);
            return true;
        }
        return false;
    }

    async AirdropClaim(address: string, amount: string, data: { to: string; amount: string; }[]): Promise<boolean> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return false; }
        
        let index = data.findIndex(entry => entry.to === address && entry.amount === amount);
        if (index === -1) { return false; }
        let proof = Merkle.calculateProof(Merkle.getLeafAtIndex(index, data), Merkle.createLeaves(data));
        let contract: ethers.Contract | null = this.getContract(Contracts.get("AirdropDemo")!, network)
        if (contract) {
            await (contract as AirdropDemo).claim(await this.signer.getAddress(), address, amount, proof);
            return true;
        }
        return false;
    }

    async AirdropHasClaimed(address: string): Promise<boolean | null> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return false; }

        let contract: ethers.Contract | null = this.getContract(Contracts.get("AirdropDemo")!, network)
        if (contract) {
            let claimStatus = await (contract as AirdropDemo).hasClaimed(await this.signer.getAddress(), address);
            return claimStatus;
        }
        return null;
    }

    AirdropCheckClaim(address: string, data: { to: string; amount: string; }[]): number | null{
        let claimAmount = parseInt(data.find(claim => claim.to === address)?.amount!);
        if (claimAmount) {
            return claimAmount;
        }
        return null;
    }

    //--------------------- Bridge ----------------------
    async BridgeSendTx(destination: Network, amount: string): Promise<string | null> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return null; }
        
        let contractN: ContractName = "Bridge";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network);
        let transaction: ethers.ContractTransaction;
        if (contract) {
            transaction = await (contract as IBC_Bridge).dataSend(await this.signer.getAddress(), amount, destination.id);
            return await this.BridgeGetSignature(transaction);
        } else {
            return null;
        }
    }

    async BridgeGetSignature(tx: ethers.ContractTransaction): Promise<string | null> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return null; }
        
        let receipt = await tx.wait();
        let queryParameters = `?txHash=${receipt.transactionHash}&chainId=${network.id}`;
        try {
            let { signature } = await (await fetch(this.signerAPI + queryParameters)).json();
        return signature ? signature : null;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async BridgeCompleteTransfer(signature: string, sendingChain: string, amount: string): Promise<boolean> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return false; }

        let contractN: ContractName = "Bridge";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            await (contract as IBC_Bridge).dataReceive(await this.signer.getAddress(), sendingChain, amount, signature);
            return true;
        }
        return false;
    }

    async BridgePendingTransaction(sendingChain: Network, receivingChain: Network): Promise<boolean> {
        let contractN: ContractName = "Bridge";
        let sendingContract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, receivingChain);
        let receivingContract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, receivingChain);
        if (sendingContract && receivingContract) {
            let sendingNonce = await (sendingContract as IBC_Bridge).nonce(await this.signer.getAddress(), sendingChain.id, receivingChain.id);
            let receivingNonce = await (receivingContract as IBC_Bridge).nonce(await this.signer.getAddress(), sendingChain.id, receivingChain.id);
            if (sendingNonce.toString() === receivingNonce.toString()) {
                return false;
            } else {
                console.log("Sender: " + sendingNonce + "Receiver: " + receivingNonce);
                return true;
            }
        }
        return false;
    }

    //--------------------- Reflect ----------------------
    async ReflectGetPrice(): Promise<string | null> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return null; }

        let contractN: ContractName = "Reflect";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            return (await (contract as ReflectToken).purchasePrice()).toString();
        }
        return null;
    }

    async ReflectGetToken(amount: string): Promise<boolean> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return false; }

        let contractN: ContractName = "Reflect";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            await (contract as ReflectToken).purchaseTokens(amount);
            return true;
        }
        return false;
    }

    async ReflectBalance(address: string): Promise<string | null> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return null; }

        let contractN: ContractName = "Reflect";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            return await (contract as ReflectToken).balanceOf(address).toString();
        }
        return null;
    }

    async ReflectTransfer(recipient: string, amount: string): Promise<boolean> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return false; }

        let contractN: ContractName = "Reflect";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            await (contract as ReflectToken).transfer(recipient, amount).toString();
            return true;
        }
        return false;
    }
    
    //--------------------- Flipper ----------------------    
    async FlipperAddFunds(amount: string): Promise<boolean> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return false; }

        let contractN: ContractName = "Flipper";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            await (contract as CoinFlipper).placeBet(amount);
            return true;
        }
        return false;
    }

    async FlipperCheckFunds(): Promise<string | null> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return null; }

        let contractN: ContractName = "Flipper";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            return await (contract as CoinFlipper).getBalance().toString();
        }
        return null;
    }

    async FlipperFlipCoin(): Promise<boolean> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return false; }

        let contractN: ContractName = "Flipper";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            await (contract as CoinFlipper).startCoinFlip();
            return true;
        }
        return false;
    }

    async FlipperWithdrawFunds(amount: string): Promise<boolean> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return false; }

        let contractN: ContractName = "Flipper";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            await (contract as CoinFlipper).payOut(amount);
            return true;
        }
        return false;
    }
    
    //--------------------- Staker ---------------------- 
    async StakeAddFunds(amount: string): Promise<boolean> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return false; }

        let contractN: ContractName = "Staker";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            await (contract as Staker).stake(amount);
            return true;
        }
        return false;
    }

    async StakeWithdrawFunds(amount: string): Promise<boolean> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return false; }

        let contractN: ContractName = "Staker";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            await (contract as Staker).withdraw(amount);
            return true;
        }
        return false;
    }

    async StakeCheckStake(): Promise<string | null> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return null; }

        let contractN: ContractName = "Staker";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            return await (await (contract as Staker).balanceOf(await this.signer.getAddress())).toString();
        }
        return null;
    }

    async StakeCheckReward(): Promise<string | null> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return null; }

        let contractN: ContractName = "Staker";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            return await (contract as Staker).earned(await this.signer.getAddress()).toString();
        }
        return null;
    }

    async StakeClaimReward(): Promise<boolean> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return false; }

        let contractN: ContractName = "Staker";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            await (contract as Staker).getReward();
            return true;
        }
        return false;
    }

    //--------------------- NFT ---------------------- 
    async NFTMint(message: string): Promise<boolean> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return false; }

        let contractN: ContractName = "NFT";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            let encodedMessage = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));
            await (contract as NFTDemo).mint(await this.signer.getAddress(), encodedMessage);
            return true;
        }
        return false;
    }

    async NFTBalance(address: string): Promise<string | null> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return null; }

        let contractN: ContractName = "NFT";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            return await (contract as NFTDemo).balanceOf(await this.signer.getAddress()).toString();
        }
        return null;
    }

    async NFTGetOwner(tokenId: string): Promise<string | null> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return null; }

        let contractN: ContractName = "NFT";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            return await (contract as NFTDemo).ownerOf(tokenId);
        }
        return null;
    }

    async NFTTransfer(recipient: string, tokenId: string): Promise<boolean> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return false; }

        let contractN: ContractName = "NFT";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            await (contract as NFTDemo).transferFrom(await this.signer.getAddress(), recipient, tokenId);
        }
        return false;
    }

    async NFTFetchAll(address?: string): Promise<Array<string> | null> {
        let network: Network | null = await this.GetNetwork();
        if (!network) { return null; }

        if (this.cachedNFT.get(network.id)) { return this.cachedNFT.get(network.id)!; }

        let contractN: ContractName = "NFT";
        let contract: ethers.Contract | null = this.getContract(Contracts.get(contractN)!, network)
        if (contract) {
            let filterReceipt: ethers.EventFilter = contract.filters.Transfer(null, address || await this.signer.getAddress());
            let filterSent: ethers.EventFilter = contract.filters.Transfer(address || await this.signer.getAddress());
            let eventReceipt: ethers.Event[] = await contract.queryFilter(filterReceipt);
            let eventSent: ethers.Event[] = await contract.queryFilter(filterSent);
            let tokensOwned: Array<string> = [];

            // Add all received tokens.
            eventReceipt.forEach(receiptEvent => {
                let id = receiptEvent.args?.[2];
                if(id) { tokensOwned.push(receiptEvent.args?.[2]); }
            });

            // Remove all sent tokens.
            eventSent.forEach(sentEvent => {
                let id = sentEvent.args?.[2];
                if (id) {
                    tokensOwned = tokensOwned.filter(token => token !== id);
                }
            });
            
            // Return filtered result
            this.cachedNFT.set(network.id, tokensOwned);
            return tokensOwned;
        }
        return null;
    }
}