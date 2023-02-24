import IController from "./IController";
import { Network, Contract, TransactionStatus, WalletEvent, ContractName, Web3Transaction, NetworkName } from "./Definitions";
import { Networks, Contracts } from "./Networks";
import { Error } from "./Errors";
import { ContractTransaction, ethers } from 'ethers';
import Merkle from "../../contracts/scripts/merkleRootCalculator";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { DemoToken } from '../../contracts/typechain-types/contracts/A_DemoToken';
import { AirdropDemo } from '../../contracts/typechain-types/contracts/B_Airdrop/AirdropDemo';
import { IBC_Bridge } from "../../contracts/typechain-types/contracts/C_IBC_Messenger/IBC_Bridge";
import { ReflectToken } from "../../contracts/typechain-types/contracts/D_Reflect_Token";
import { Staker } from '../../contracts/typechain-types/contracts/E_Staker';
import { FamiliarLogic } from '../../contracts/typechain-types/contracts/F_Upgradable_NFT/FamiliarLogic';
import { CoinFlipper } from '../../contracts/typechain-types/contracts/G_Oracle_Contract';

declare global {
    interface Window {
        ethereum: MetaMaskInpageProvider;
    }
}

export default class AppController implements IController {
    
    /**
     * Checks whether RPC requests are possible.
     * @returns true if RPC requests are possible.
     */
    ConnectionStatus(): boolean {
        let status = window.ethereum?.isConnected();
        if (status === undefined) return false;
        return status;
    }

    /**
     * Function specified by EIP-1102 for requesting user accounts.
     * @returns array of a single blockchain account from user or error message.
     */
    async RequestConnection(): Promise<[Error | null, string | null]> {
        
        let web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
        if (web3Provider) {
            try {
                await web3Provider.send('eth_requestAccounts', []);
                let address = await web3Provider.getSigner()?.getAddress();
                return [null, address];
            } catch (error) {
                if (error.code === 4001) {
                    return [{ code: 10, reason: "Request rejected by user.", stack: error }, null];
                }
                else {
                    return [{ code: 11, reason: "JSON-RPC error.", stack: error }, null];
                }
            }
        }
        return [{ code: 1, reason: "Web3 provider not available."}, null];
    }

    /**
     * Queries connected RPC provider for the current network.
     * @returns the currently connected blockchain network or error.
     */
    async GetNetwork(): Promise<[Error | null, Network | null]> {
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
                return network ? [null, network] : [{ code: 2, reason: "Unknown network."}, null];
            } catch (error) {
                return [{ code: 11, reason: "JSON-RPC error."}, null];
            }
        }
        return [{ code: 1, reason: "Web3 provider not available."}, null];
    }

    /**
     * Requests Metamask API to switch to different network. It first checks if new network
     * is already configured. If not configured, request to add new network configuration.
     * @param network blockchain network to be switched to.
     * @returns error if the user rejects request or network switch failed.
     */
    async ChangeNetwork(network: Network): Promise<[Error | null]> {
        let web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
        if (web3Provider) {
            try {
                await web3Provider.send(
                    'wallet_switchEthereumChain',
                    [{ chainId: network.hexID }],
                );
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
                    } catch (addingError) {
                        // handle "add" error
                        if (addingError.code === 4001) return [{ code: 10, reason: "Request rejected by user." }];
                        return [{ code: 11, reason: "JSON-RPC error." }];
                    }
                }
            }
        }
        return [null];
    }

    /**
     * Subscribes event notification for blockchain transaction lifecycle.
     * @param transaction transaction to watch for changes.
     * @param network blockchain network where transaction was submitted.
     * @param callback callback function handling change events.
     * @returns error if web3 provider is not available.
     */
    async onTransactionStatusChange(
        transaction: ContractTransaction,
        network: NetworkName,
        callback: (hash: string, tx: Web3Transaction) => void
    ): Promise<[Error | null]> {

        // Set up provider connection
        let provider = new ethers.providers.Web3Provider(window.ethereum as any);
        if (!provider) { return [{ code: 1, reason: "Web3 provider not available." }]; }

        if (transaction.confirmations > 0) {
            // transaction has been mined.
            callback(transaction.hash, { network: network, status: TransactionStatus.CONFIRMED });
        } else {
            // transaction has not been mined yet.
            callback(transaction.hash, { network: network, status: TransactionStatus.PENDING });
            await transaction.wait();
            callback(transaction.hash, { network: network, status: TransactionStatus.CONFIRMED });
        }
        return [null];
    }

    /**
     * Helper function that provides access to the signer, network, and contract instance.
     * @param contract smart contract API to be instantiated.
     * @returns Signer account, network information, and contract instance. Error in case any of these are missing.
     */
    async getWeb3Artifacts(contract: Contract): Promise<[Error | null, [ethers.Signer, Network, ethers.Contract] | null]> {
        let web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
        if (!web3Provider) { return [{ code: 1, reason: "Web3 provider not available." }, null]; }

        let signer = web3Provider.getSigner();
        if (!signer) { return [{ code: 11, reason: "JSON-RPC error." }, null]; }

        let [networkError, network] = await this.GetNetwork();
        if (network === null) { return [networkError, network]; }

        let contractData = contract.instances.find(instance => (network as Network).name === instance.network);
        if (!contractData) { return [{ code: 3, reason: "Contract does not exist on this network." }, null] }
        
        let instance = new ethers.Contract(contractData.address, contract.abi, signer);
        return [null, [signer, network, instance]];
    }

    //================================================================================================================
    //                                     DEMO TOKEN
    //================================================================================================================
    /**
     * Transactional function. Mints new DEMO token to the user's connected account.
     * @param callback transaction event handler.
     * @returns error in case of RPC-JSON network issues.
     */
    async GetTestTokens(callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Token")!);
        if (web3Artifact === null) { return [web3Error]; }
        
        let [, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        try {
            let tx = await (contract as DemoToken).faucet();
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) return [{ code: 10, reason: "Request rejected by user." }];
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        }
    }

    /**
     * View Function. Queries token contract for the balance of the provided address or user's address.
     * @param address [option] address to be queried. Defaults to user's connected account.
     * @returns token balance.
     */
    async GetTestTokenBalance(address?: string): Promise<[Error | null, string | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Token")!);
        if (web3Artifact === null) { return [web3Error, null]; }

        let [signer, , contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        try {
            let rawBalance = await (contract as DemoToken).balanceOf(address || await signer.getAddress());
            return [null, ethers.utils.formatEther(rawBalance)];
        } catch (error) {
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }, null];
        }
    }

    //================================================================================================================
    //                                     AIRDROP DEMO
    //================================================================================================================
    /**
     * Transaction function. Generates and set a new Merkle root for the provided list of recipient data.
     * @param recipients list of (address, amount) tuples which defines the airdrop beneficiaries.
     * @param callback transaction event handler.
     * @returns error in case of RPC-JSON network issues.
     */
    async AirdropNewRecipients(recipients: { to: string, amount: string }[], callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Airdrop")!);
        if (web3Artifact === null) { return [web3Error]; }

        let [, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        let parsedRecipients: Array<{ to: string, amount: string }> = recipients.map(entry => {
            return {
                to: entry.to,
                amount: ethers.utils.parseEther(entry.amount).toString()
            }
        });
        let root = Merkle.calculateMerkleRoot(Merkle.createLeaves(parsedRecipients));
        try {
            let tx = await (contract as AirdropDemo).createAirdrop(root);
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) return [{ code: 10, reason: "Request rejected by user." }];
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        }
    }

    /**
     * Transactional function. Allows user to claim airdrop.
     * @param creator address of airdrop sponsor needed by contract to locate Merkle root.
     * @param address address of airdrop recipient. Must match exactly the airdrop data.
     * @param amount number of tokens to be claimed. Must match exactly the airdrop data.
     * @param data list of airdrop recipients used to calculate original Merkle root.
     * @param callback transaction event handler.
     * @returns error in case of RPC-JSON network issues.
     */
    async AirdropClaim(creator: string, address: string, amount: string, data: { to: string; amount: string; }[], callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Airdrop")!);
        if (web3Artifact === null) { return [web3Error]; }

        let [, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        let parsedAmount = ethers.utils.parseEther(amount).toString();
        let parsedData: Array<{ to: string, amount: string }> = data.map(entry => {
            return {
                to: entry.to,
                amount: ethers.utils.parseEther(entry.amount).toString()
            }
        });
        let index = parsedData.findIndex(entry => entry.to === address && entry.amount === amount);
        if (index === -1) { return [{ code: 12, reason: "Provided entry not found in recipient list." }]; }
        let proof = Merkle.calculateProof(Merkle.getLeafAtIndex(index, parsedData), Merkle.createLeaves(parsedData));
        
        try {
            let tx = await (contract as AirdropDemo).claim(creator, address, parsedAmount, proof);
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) { return [{ code: 10, reason: "Request rejected by user." }]; }
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        }
    }

    /**
     * View function. Queries whether an account has already claimed airdrop sponsored by user.
     * @param address address to be queried.
     * @returns whether the given account has claimed airdrop or error in case of JSON-RPC issues.
     */
    async AirdropHasClaimed(address: string): Promise<[Error | null, boolean | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Airdrop")!);
        if (web3Artifact === null) { return [web3Error, null]; }

        let [signer, , contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        
        try {
            return [null, await (contract as AirdropDemo).hasClaimed(await signer.getAddress(), address)];
        } catch (error) {
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }, null];
        }
    }

    //================================================================================================================
    //                                     BRIDGE DEMO
    //================================================================================================================
    /**
     * Transaction function. Initiates token transfer between supported blockchains.
     * @param destination chain ID of destination network.
     * @param amount amount of tokens to transfer.
     * @param callback transaction event handler.
     * @returns error if user rejects transaction or JSON-RPC issues.
     */
    async BridgeSendTx(destination: number, amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Bridge")!);
        if (web3Artifact === null) { return [web3Error]; }

        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        let parsedAmount = ethers.utils.parseEther(amount);

        try {
            let tx = await (contract as IBC_Bridge).dataSend(await signer.getAddress(), parsedAmount, destination);
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) { return [{ code: 10, reason: "Request rejected by user." }]; }
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        }
    }

    /**
     * Transaction function. Completes token transfer transaction on the current chain.
     * @param sendingChain chain ID of source blockchain network.
     * @param nonce transaction number to be executed.
     * @param callback transaction event handler.
     * @returns error in case of JSON-RPC issues.
     */
    async BridgeCompleteTransfer(sendingChain: number, nonce: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Bridge")!);
        if (web3Artifact === null) { return [web3Error]; }

        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        let [signError, result] = await this.BridgeGetSignature(nonce, sendingChain);
        if (result === null) { return [signError]; }

        try {
            let tx = await (contract as IBC_Bridge).dataReceive(await signer.getAddress(), sendingChain, result.amount, result.signature);
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) { return [{ code: 10, reason: "Request rejected by user." }]; }
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        }
    }

    /**
     * Relay server API. Request verification signature from relay server to complete bridging transaction.
     * @param nonce pending transaction number for which to obtain verification signature.
     * @param sender chain ID of source blockchain network.
     * @returns object specifying transfer amount and verification signature, or error in case of invalid transaction or network issues.
     */
    async BridgeGetSignature(nonce: string, sender: number): Promise<[Error | null, { amount: string, signature: string } | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Bridge")!);
        if (web3Artifact === null) { return [web3Error, null]; }

        let [signer, ,]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        
        let queryParameters = `?receiver=${await signer.getAddress()}&nonce=${nonce}&chainId=${sender}`;
        let endpoint = 'https://jddcrywwa0.execute-api.us-east-1.amazonaws.com/demo';
        
        try {
            let { amount, signature } = await (await fetch(endpoint + queryParameters)).json();
            return signature && amount ? [null, { amount, signature }] : [{ code: 20, reason: "Could not obtain signature from relay server."}, null];
        } catch (error) {
            return [{ code: 12, reason: "Network error.", stack: error }, null];
        }
    }

    /**
     * View function. Checks if there are pending bridge transactions to complete on this network.
     * @param name network name of source blockchain.
     * @param rpc JSON-RPC endpoint of source network.
     * @returns true if there are bridge transactions to complete on this network. Error on JSON-RPC issues.
     */
    async BridgeGetPending(name: NetworkName, rpc: string): Promise<[Error | null, string | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Bridge")!);
        if (web3Artifact === null) { return [web3Error, null]; }
        
        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        
        let sourceProvider: ethers.providers.Provider | undefined = new ethers.providers.JsonRpcProvider(rpc);
        let sourceContractInfo: {network: NetworkName, address: string} | undefined = Contracts.get("Bridge")!.instances.find((inst) => inst.network === name);
        if (!sourceContractInfo) { return [{ code: 3, reason: "Contract does not exist on this network." }, null]; }
        let sourceContract: ethers.Contract = new ethers.Contract(sourceContractInfo.address, Contracts.get("Bridge")!.abi, sourceProvider) as IBC_Bridge;
        
        try {
            let userAddress = await signer.getAddress();
            let destinationContract = contract as IBC_Bridge;
            let destinationNonce: ethers.BigNumber = await destinationContract.nonce(userAddress, Networks.get(name)!.id, network.id);
            let sourceNonce: ethers.BigNumber = await sourceContract.nonce(userAddress, Networks.get(name)!.id, network.id);

            // Transaction pending on source network
            return destinationNonce.lt(sourceNonce) ? [null, destinationNonce.toString()] : [null, null];
        } catch (error) {
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }, null];
        }
    }
    
    //================================================================================================================
    //                                     REFLECT TOKEN DEMO
    //================================================================================================================
    /**
     * Transaction function. Purchases an amount of Reflect tokens using DEMO tokens.
     * @param amount amount of Reflect tokens to be purchased.
     * @param callback transaction event handler.
     * @returns error in case of JSON-RPC errors.
     */
    async ReflectGetToken(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Reflect")!);
        if (web3Artifact === null) { return [web3Error]; }

        let [, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        let parsedAmount = ethers.utils.parseEther(amount);
        
        try {
            let tx = await (contract as ReflectToken).purchaseTokens(parsedAmount);
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) { return [{ code: 10, reason: "Request rejected by user." }]; }
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        }
    }

    /**
     * Transaction function. Transfers reflect tokens to a given recipient address.
     * @param recipient address of token recipient.
     * @param amount number of tokens to be transferred.
     * @param callback transaction event handler.
     * @returns error in case of JSON-RPC issues.
     */
    async ReflectTransfer(recipient: string, amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Reflect")!);
        if (web3Artifact === null) { return [web3Error]; }

        let [, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        let parsedAmount = ethers.utils.parseEther(amount);
        
        try {
            let tx = await (contract as ReflectToken).transfer(recipient, parsedAmount);
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) { return [{ code: 10, reason: "Request rejected by user." }]; }
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        }
    }

    /**
     * View function. Queries reflect token price denominated in DEMO tokens.
     * @returns Reflect token price in DEMO, or error in case of JSON-RPC issues.
     */
    async ReflectGetPrice(): Promise<[Error | null, string | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Reflect")!);
        if (web3Artifact === null) { return [web3Error, null]; }

        let [,, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        try {
            let formatPrice = await (contract as ReflectToken).purchasePrice();
            return [null, ethers.utils.formatEther(formatPrice)];
        } catch (error) {
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }, null];
        }
    }

    /**
     * View function. Queries Reflect token balance for the given address.
     * @param address address to be queried.
     * @returns amount of Reflect tokens, or error in case of JSON-RPC issues.
     */
    async ReflectBalance(address: string): Promise<[Error | null, string | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Reflect")!);
        if (web3Artifact === null) { return [web3Error, null]; }

        let [,, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        
        try {
            let balance = await (contract as ReflectToken).balanceOf(address);
            return [null, ethers.utils.formatEther(balance)];
        } catch (error) {
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }, null];
        } 
    }
    
    //================================================================================================================
    //                                     COIN FLIPPER DEMO
    //================================================================================================================
    /**
     * Transaction function. Transfers DEMO tokens from user to CoinFlip contract.
     * @param amount DEMO tokens to be transferred.
     * @param callback transaction event handler.
     * @returns error in case of JSON-RPC error.
     */
    async FlipperAddFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Flipper")!);
        if (web3Artifact === null) { return [web3Error]; }

        let [, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        let parsedAmount = ethers.utils.parseEther(amount);
        
        try {
            let tx = await (contract as CoinFlipper).placeBet(parsedAmount);
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) return [{ code: 10, reason: "Request rejected by user." }];
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        } 
    }

    /**
     * Transaction function. Initiates coin flip game and oracle query.
     * @param callback transaction event handler.
     * @returns error in case of JSON-RPC issues.
     */
    async FlipperFlipCoin(callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Flipper")!);
        if (web3Artifact === null) { return [web3Error]; }

        let [, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        try {
            let tx = await (contract as CoinFlipper).startCoinFlip();
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) { return [{ code: 10, reason: "Request rejected by user." }]; }
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        }
    }

    /**
     * Transaction function. Withdraws DEMO tokens held in contract.
     * @param amount number of tokens to withdraw from contract.
     * @param callback transaction event handler.
     * @returns error in case of JSON-RPC issues.
     */
    async FlipperWithdrawFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Flipper")!);
        if (web3Artifact === null) { return [web3Error]; }

        let [, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        let parsedAmount = ethers.utils.parseEther(amount);

        try {
            let tx = await (contract as CoinFlipper).payOut(parsedAmount);
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) { return [{ code: 10, reason: "Request rejected by user." }]; }
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        }
    }

    /**
     * View function. Queries amount of DEMO tokens held in contract.
     * @returns current token balance held in CoinFlip contract.
     */
    async FlipperCheckFunds(): Promise<[Error | null, string | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Flipper")!);
        if (web3Artifact === null) { return [web3Error, null]; }

        let [signer,, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
       
        try {
            let balance = await (contract as CoinFlipper).getPlayerBalance(await signer.getAddress());
            return [null, ethers.utils.formatEther(balance)];
        } catch (error) {
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }, null];
        }
    }
    
    //================================================================================================================
    //                                     STAKER DEMO
    //================================================================================================================
    /**
     * Transaction function. Transfer DEMO tokens from user to Staker contract.
     * @param amount number of DEMO tokens to deposit.
     * @param callback transaction event handler.
     * @returns error in case of JSON-RPC issues.
     */
    async StakeAddFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (web3Artifact === null) { return [web3Error]; }

        let [, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        let parsedAmount = ethers.utils.parseEther(amount);
        try {
            let tx = await (contract as Staker).stake(parsedAmount);
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) { return [{ code: 10, reason: "Request rejected by user." }]; }
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        }
    }

    /**
     * Transaction function. Withdraws DEMO tokens currently deposited in Staker contract.
     * @param amount number of tokens to withdraw.
     * @param callback transaction event handler.
     * @returns error in case of JSON-RPC issues.
     */
    async StakeWithdrawFunds(amount: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (web3Artifact === null) { return [web3Error]; }

        let [, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        let parsedAmount = ethers.utils.formatEther(amount);
        
        try {
            let tx = await (contract as Staker).withdraw(parsedAmount);
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) { return [{ code: 10, reason: "Request rejected by user." }] };
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        }
    }

    /**
     * Transaction function. Claim earned DEMO tokens held in contract.
     * @param callback transaction event handler.
     * @returns error in case of JSON-RPC issues.
     */
    async StakeClaimReward(callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (web3Artifact === null) { return [web3Error]; }

        let [, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        try {
            let tx = await (contract as Staker).getReward();
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) { return [{ code: 10, reason: "Request rejected by user." }]; }
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        }
    }

    /**
     * View function. Queries contract for balance of DEMO tokens deposited to contract.
     * @returns number of tokens deposited to contract, or error in case of JSON-RPC issues.
     */
    async StakeCheckStake(): Promise<[Error | null, string | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (web3Artifact === null) { return [web3Error, null]; }

        let [signer,, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        
        try {
            let balance = await (contract as Staker).balanceOf(await signer.getAddress());
            return [null, ethers.utils.formatEther(balance)];
        } catch (error) {
            if (error.code === 4001) { return [{ code: 10, reason: "Request rejected by user." }, null]; }
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }, null];
        }
    }

    /**
     * View function. Queries contract for number of tokens earned by user.
     * @returns number of tokens earned by user, or error in case of JSON-RPC issues.
     */
    async StakeCheckReward(): Promise<[Error | null, string | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("Staker")!);
        if (web3Artifact === null) { return [web3Error, null]; }

        let [signer,, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        try {
            let reward = await (contract as Staker).earned(await signer.getAddress());
            return [null, ethers.utils.formatEther(reward)];
        } catch (error) {
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }, null];
        }
    }

    //================================================================================================================
    //                                     UPGRADABLE NFT DEMO
    //================================================================================================================
    /**
     * Transaction function. Creates new NFT for user with a given message.
     * @param message message to be stored in NFT's metadata.
     * @param callback transaction event handler.
     * @returns error in case of JSON-RPC issues.
     */
    async NFTMint(message: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("NFT")!);
        if (web3Artifact === null) { return [web3Error]; }

        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        let encodedMessage = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));
        
        try {
            let tx = await (contract as FamiliarLogic).mint(await signer.getAddress(), encodedMessage);
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) { return [{ code: 10, reason: "Request rejected by user." }]; }
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        }
    }

    /**
     * Transaction function. Transfer an NFT to another address.
     * @param recipient address of NFT recipient.
     * @param tokenId token ID of NFT.
     * @param callback transaction event handler.
     * @returns error in case of JSON-RPC issues.
     */
    async NFTTransfer(recipient: string, tokenId: string, callback: (hash: string, tx: Web3Transaction) => void): Promise<[Error | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("NFT")!);
        if (web3Artifact === null) { return [web3Error]; }

        let [signer, network, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        try {
            let tx = await (contract as FamiliarLogic).transferFrom(await signer.getAddress(), recipient, tokenId);
            this.onTransactionStatusChange(tx, network.name, callback);
            return [null];
        } catch (error) {
            if (error.code === 4001) { return [{ code: 10, reason: "Request rejected by user." }]; }
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }];
        }
    }

    /**
     * View function. Queries contract for number of DEMO NFTs owned by given address.
     * @param address address to be queried.
     * @returns number of NFTs owned by address, or error in case of JSON-RPC issues.
     */
    async NFTBalance(address: string): Promise<[Error | null, string | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("NFT")!);
        if (web3Artifact === null) { return [web3Error, null]; }

        let [,, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        try {
            let nftBalance = await (contract as FamiliarLogic).balanceOf(address);
            return [null, nftBalance.toString()];
        } catch (error) {
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }, null];
        }
    }

    /**
     * View function. Shows the address owning the NFTs with the given token ID.
     * @param tokenId token ID of NFT to be queried.
     * @returns address of NFT owner, or error in case of JSON-RPC issues.
     */
    async NFTGetOwner(tokenId: string): Promise<[Error | null, string | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("NFT")!);
        if (web3Artifact === null) { return [web3Error, null]; }

        let [,, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        try {
            return [null, await (contract as FamiliarLogic).ownerOf(tokenId)];
        } catch (error) {
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }, null];
        }
    }

    /**
     * View function. Retrieves the message saved in NFT's metadata.
     * @param tokenId token ID of NFT being queried.
     * @returns object with image URI and message string, or error in case of RPC-JSON issues.
     */
    async NFTGetMetadata(tokenId: string): Promise<[Error | null, { url: string, message: string } | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("NFT")!);
        if (web3Artifact === null) { return [web3Error, null]; }

        let [,, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;

        try {
            let url = await (contract as FamiliarLogic).tokenURI(tokenId);
            let message = await (contract as FamiliarLogic).getTokenBlueprint(tokenId);
            return [null, { url, message }];
        } catch (error) {
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }, null];
        }
    }

    /**
     * View function. Returns all NFTs still owned by given address. Defaults to currently connected account.
     * Note: Due to RPC limitation, only tracks NFTs received in the last 2000 blockchain blocks.
     * @param address [option] address to fetch owned NFTs.
     * @returns array of token IDs for NFTs currently owned by address, or error in case of JSON-RPC issues.
     */
    async NFTFetchAll(address?: string): Promise<[Error | null, Array<string> | null]> {
        let [web3Error, web3Artifact] = await this.getWeb3Artifacts(Contracts.get("NFT")!);
        if (web3Artifact === null) { return [web3Error, null]; }

        let [signer,, contract]: [ethers.Signer, Network, ethers.Contract] = web3Artifact;
        let userAddress: string = address || await signer.getAddress();

        try {
            let currentBlock: number | undefined = await signer.provider?.getBlockNumber();
            if (!currentBlock) { return [{ code: 4, reason: "Failed to fetch block number." }, null]; }
               
            let filterReceipt: ethers.EventFilter = contract.filters.Transfer(null, userAddress);
            let eventReceipt: ethers.Event[] = await contract.queryFilter(filterReceipt, currentBlock - 2000);
            let tokensOwned: Array<string> = [];

            // Check all received tokens.
            eventReceipt.forEach(async receiptEvent => {
                let id = receiptEvent.args?.[2];
                let [, nftOwner] = await this.NFTGetOwner(id.toString());
                if (nftOwner === null) { return; }
                if (nftOwner === userAddress) {
                    tokensOwned.push(id.toString());
                }
            });
            return [null, tokensOwned];
        } catch (error) {
            return [{ code: 11, reason: "JSON-RPC error.", stack: error }, null];
        }
    }
}