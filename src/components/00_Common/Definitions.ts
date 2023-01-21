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
        contract: Contract
}

export type ContractName = "Airdrop" | "NFT" | "Staker" | "Reflect" | "Flipper" | "Bridge" | "Token"

export type Contract = 
{
        name: ContractName,
        instances: Array<{
                network: string,
                address: string
        }>,
        abi: Array<ABIItem>
}

export type Network =
{
        name: string,
        id: number,
        hexID: string,
        explorer: string,
        rpcUrl: string,
        faucet: string | null
}
       