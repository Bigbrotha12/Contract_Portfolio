import { NetworkName, TransactionStatus, Web3Transaction } from "./Definitions";
import { ContractTransaction, ethers } from "ethers";

export default class BlockchainWatch {

    static async onTransactionStatusChange(transaction: ContractTransaction, network: NetworkName, callback: (hash: string, tx: Web3Transaction) => void): Promise<void> {
       // Set up provider connection
        let provider = new ethers.providers.Web3Provider(window.ethereum as any);
        if (!provider) {
            console.error("BlockchainWatcher: No injected provider.");
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
}