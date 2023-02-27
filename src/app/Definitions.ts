export type Content =
{
        title: string,
        icon: string | null,
        content: string
}

export type ABIItem =
{
        name?: string,
        inputs?: Array<{name: string, type: string}>,
        outputs?: Array<{name: string, type: string}>,
        stateMutability?: "view" | "payable" | "nonpayable" | string,
        type: "function" | "event" | "constructor" | string
}

export type AppConnectionData =
{
        account: string,
        network: Network,
        contract: Contract,
        transactions: Map<string, Web3Transaction>,
        walletMnemonics?: string
}

export type Action = {
        type: "ACCOUNT_CHANGE",
        payload: string
        } | {
        type: "NETWORK_CHANGE",
        payload: Network
        } | {
        type: "CONTRACT_CHANGE",
        payload: Contract
        } | {
        type: "ADD_TRANSACTION",
        payload: Map<string, Web3Transaction>
        } | { 
        type: "DISCONNECT_ACCOUNT",
        payload: null | undefined
        } | {
        type: "FALLBACK_WALLET",
        payload: string        
        }

export type Web3Transaction = {
        network: NetworkName,
        status: TransactionStatus
}
export enum TransactionStatus { DRAFT, PENDING, CONFIRMED };
export type ContractName = "Airdrop" | "NFT" | "Staker" | "Reflect" | "Flipper" | "Bridge" | "Token" | "Empty";
export type NetworkName = "Not Connected" | "Ethereum" | "Goerli" | "Binance Smart Chain" | "BNB Chain Testnet" | "Polygon" | "Polygon Mumbai";

export type Contract = 
{
        name: ContractName,
        instances: Array<{
                network: NetworkName,
                address: string
        }>,
        abi: Array<ABIItem>
}

export type Network =
{
        name: NetworkName,
        icon: string,
        id: number,
        hexID: string,
        explorer: string,
        rpcUrl: string,
        faucet: string | null
}

export enum WalletEvent {
        Null,
        Connect,
        Disconnect,
        AccountChange,
        NetworkChange
}