import IController from "./IController";
import { Network, Contract, TransactionStatus, WalletEvent, ContractName, Web3Transaction, NetworkName } from "./Definitions";
import { Networks, Contracts } from "./Networks";
import { ContractTransaction, ethers } from 'ethers';
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

export default class AppController implements IController {
    
    // Core
    ConnectionStatus(): boolean {
        return window.ethereum?.isConnected();
    }

    async RequestConnection(): Promise<string | null> {
        
        let web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
        if (web3Provider) {
            try {
                await web3Provider.send('eth_requestAccounts', []);
                let address = await web3Provider.getSigner()?.getAddress();
                return address;
            } catch (error) {
                if (error.code === 4001) { console.log("Request rejected by user."); }
                else { console.log("Internal Error."); }
            }
        }
        return null;
    }

    async GetNetwork(): Promise<Network | null> {
        let web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
        if (web3Provider) {
            try {
                let id: string = await web3Provider.send('eth_chainId', []);
                console.log("ChainId: %s", id);
                let network: Network | null = null;
                Networks.forEach(value => {
                    if (id === value.hexID) {
                        network = value;
                    }
                });
                return network;
            } catch (error) {
                console.log(error);
                return null;
            }
        }
        return null;
    }

    async ChangeNetwork(network: Network): Promise<boolean> {
        let web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
        if (web3Provider) {
            try {
                await web3Provider.send(
                    'wallet_switchEthereumChain',
                    [{ chainId: network.hexID }],
                );
                return true;
            } catch (switchingError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchingError.code === 4902) {
                    try {
                        await web3Provider.send(
                            'wallet_addEthereumChain',
                            [
                                {
                                    chainId: network.hexID,
                                    chainName: network.name,
                                    rpcUrls: [network.rpcUrl],
                                    // nativeCurrency: {
                                    //     name: '',
                                    //     symbol: '',
                                    //     decimal: 18
                                    // }
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

    async onTransactionStatusChange(transaction: ContractTransaction, network: NetworkName, callback: (hash: string, tx: Web3Transaction) => void): Promise<void> {
        // Set up provider connection
        let provider = new ethers.providers.Web3Provider(window.ethereum as any);
        if (!provider) {
            console.error("Controller: No injected provider.");
            return;      
        }

        if (transaction.confirmations > 0) {
            // transaction has been mined.
            callback(transaction.hash, { network: network, status: TransactionStatus.CONFIRMED });
        } else {
            // transaction has not been mined yet.
            callback(transaction.hash, { network: network, status: TransactionStatus.PENDING });
            await transaction.wait();
            callback(transaction.hash, { network: network, status: TransactionStatus.CONFIRMED });
        }
    }

    async getWeb3Artifacts(contract: Contract): Promise<[ethers.Signer, Network, ethers.Contract] | null> {
        let web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
        if (!web3Provider) {
            console.error("No provider available.");
            return null;
        }

        let signer = web3Provider.getSigner();
        if (!signer) {
            console.error("Signer must be defined.");
            return null;
        }

        let network: Network | null = null;
        try {
            let id: string = await web3Provider.send('eth_chainId', []);
            Networks.forEach(value => {
                if (id === value.hexID) {
                    network = value;
                }
            });
        } catch (error) {
            console.log(error);
            return null;
        }
        if (!network) { return null; }

        let contractData = contract.instances.find(instance => network!.name === instance.network);
        if (!contractData) {
            console.error("Contract instantiation error.");
            return null;
        }
        let instance = new ethers.Contract(contractData.address, contract.abi, signer);
        
        return [signer, network, instance];
    }

    //---------------------- Demo Token -----------------
    async GetTestTokens(): Promise<boolean> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Token")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return false;
        }
        let [, , contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        await (contract as DemoToken).faucet();
        return true;
    }

    async GetTestTokenBalance(address?: string): Promise<string | null> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Token")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return null;
        }
        let [signer, , contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        return await (await (contract as DemoToken).balanceOf(address || await signer.getAddress())).toString();
    }

    //---------------------- Airdrop Demo ---------------

    async AirdropNewRecipients(recipients: { to: string; amount: string; }[], callback: (hash: string, tx: Web3Transaction) => void): Promise<void> {
        console.log(recipients);
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Airdrop")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return;
        }
        let [, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        let root = Merkle.calculateMerkleRoot(Merkle.createLeaves(recipients));
        let tx = await (contract as AirdropDemo).createAirdrop(root);
        this.onTransactionStatusChange(tx, network.name, callback);
    }

    async AirdropClaim(creator: string, address: string, amount: string, data: { to: string; amount: string; }[], callback: (hash: string, tx: Web3Transaction) => void): Promise<void> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Airdrop")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return;
        }
        let [, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        let index = data.findIndex(entry => entry.to === address && entry.amount === amount);
        if (index === -1) {
            console.error("Address not found in list.");
            return;
        }
        let proof = Merkle.calculateProof(Merkle.getLeafAtIndex(index, data), Merkle.createLeaves(data));
        let tx = await (contract as AirdropDemo).claim(creator, address, amount, proof);
        this.onTransactionStatusChange(tx, network.name, callback);
    }

    async AirdropHasClaimed(address: string): Promise<boolean | null> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Airdrop")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return false;
        }
        let [signer, , contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        
        let claimStatus = await (contract as AirdropDemo).hasClaimed(await signer.getAddress(), address);
        
        return claimStatus;
    }

    AirdropCheckClaim(address: string, data: { to: string; amount: string; }[]): number | null {
        let claimAmount = parseInt(data.find(claim => claim.to === address)?.amount!);
        if (claimAmount) {
            return claimAmount;
        }
        return null;
    }

    //--------------------- Bridge ----------------------
    async BridgeCheckNonce(destination: Network): Promise<boolean | null> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Bridge")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return null;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        let userAddress = await signer.getAddress();
        let sourceNonce = await (contract as IBC_Bridge).nonce(userAddress, network.id, destination.id);
        let destProvider = new ethers.providers.JsonRpcProvider(destination.rpcUrl);
        let destAddress = Contracts.get("Bridge")!.instances.find((inst) => inst.network === destination.name)?.address;
        if (!destAddress) {
            console.error("Contract does not exist in destination network.");
            return null;
        }
        let destContract = contract.attach(destAddress).connect(destProvider) as IBC_Bridge;
        let destNonce = await destContract.nonce(userAddress, network.id, destination.id);
        if (!sourceNonce || !destNonce) {
            console.error("Unable to obtain on-chain nonce.");
            return null;
        }

        console.log("Source Nonce: %d, Destination Nonce: %d", sourceNonce, destNonce);
        return sourceNonce === destNonce;
    }
    
    async BridgeSendTx(destination: Network, amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<string | null> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Bridge")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return null;
        }
        let [signer,, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        
        let transaction = await (contract as IBC_Bridge).dataSend(await signer.getAddress(), amount, destination.id);
        let receipt = await transaction.wait(4);  // Wait for 4 confirmation prior to sending to backend.
        return await this.BridgeGetSignature(receipt);
    }

    async BridgeGetSignature(receipt: ethers.ContractReceipt): Promise<string | null> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Bridge")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return null;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        
        let queryParameters = `?txHash=${receipt.transactionHash}&chainId=${network.id}`;
        let endpoint = '';
        try {
            let { signature } = await (await fetch(endpoint + queryParameters)).json();
            return signature ? signature : null;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async BridgeCompleteTransfer(signature: string, sendingChain: string, amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<boolean> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Bridge")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return false;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        await (contract as IBC_Bridge).dataReceive(await signer.getAddress(), sendingChain, amount, signature);
        
        return true;
    }

    //--------------------- Reflect ----------------------
    async ReflectGetPrice(): Promise<string | null> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Reflect")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return null;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        return (await (contract as ReflectToken).purchasePrice()).toString();
    }

    async ReflectGetToken(amount: string): Promise<boolean> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Reflect")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network data.");
            return false;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        await (contract as ReflectToken).purchaseTokens(amount);
        
        return true;
    }

    async ReflectBalance(address: string): Promise<string | null> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Reflect")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return null;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        return await (contract as ReflectToken).balanceOf(address).toString();
    }

    async ReflectTransfer(recipient: string, amount: string): Promise<boolean> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Reflect")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return false;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        await (contract as ReflectToken).transfer(recipient, amount).toString();
        
        return true;
    }
    
    //--------------------- Flipper ----------------------    
    async FlipperAddFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Flipper")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network data.");
            return;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        let tx = await (contract as CoinFlipper).placeBet(amount);
        this.onTransactionStatusChange(tx, network.name, callback);
    }

    async FlipperCheckFunds(): Promise<string | null> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Flipper")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network data.");
            return null;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        return await (contract as CoinFlipper).getBalance().toString();
    }

    async FlipperFlipCoin(callback: (hash: string, tx: Web3Transaction) => void): Promise<void> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Flipper")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network data.");
            return;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        let tx = await (contract as CoinFlipper).startCoinFlip();
        this.onTransactionStatusChange(tx, network.name, callback);
    }

    async FlipperWithdrawFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<void> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Flipper")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network data.");
            return;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        let tx = await (contract as CoinFlipper).payOut(amount);
        this.onTransactionStatusChange(tx, network.name, callback);
    }
    
    //--------------------- Staker ---------------------- 
    async StakeAddFunds(amount: string): Promise<boolean> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return false;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        await (contract as Staker).stake(amount);
        
        return true;
    }

    async StakeWithdrawFunds(amount: string): Promise<boolean> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return false;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        await (contract as Staker).withdraw(amount);
        
        return true;
    }

    async StakeCheckStake(): Promise<string | null> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return null;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        return await (await (contract as Staker).balanceOf(await signer.getAddress())).toString();
    }

    async StakeCheckReward(): Promise<string | null> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return null;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        return await (contract as Staker).earned(await signer.getAddress()).toString();
    }

    async StakeClaimReward(): Promise<boolean> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return false;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        await (contract as Staker).getReward();
        
        return true;
    }

    //--------------------- NFT ---------------------- 
    async NFTMint(message: string): Promise<boolean> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return false;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        
        let encodedMessage = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));
        await (contract as NFTDemo).mint(await signer.getAddress(), encodedMessage);
        
        return true;
    }

    async NFTBalance(address: string): Promise<string | null> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return null;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        return await (contract as NFTDemo).balanceOf(await signer.getAddress()).toString();
    }

    async NFTGetOwner(tokenId: string): Promise<string | null> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return null;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        return await (contract as NFTDemo).ownerOf(tokenId);
    }

    async NFTTransfer(recipient: string, tokenId: string): Promise<boolean> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return false;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        await (contract as NFTDemo).transferFrom(await signer.getAddress(), recipient, tokenId);
        return true;
    }

    async NFTFetchAll(address?: string): Promise<Array<string> | null> {
        let web3Artifact = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (!web3Artifact) {
            console.error("Unable to obtain signer / network / contract data.");
            return null;
        }
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        let filterReceipt: ethers.EventFilter = contract.filters.Transfer(null, address || await signer.getAddress());
        let filterSent: ethers.EventFilter = contract.filters.Transfer(address || await signer.getAddress());
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
        return tokensOwned;
    }
}