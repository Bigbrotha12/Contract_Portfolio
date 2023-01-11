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

export type Contract = 
{
        name: string,
        address: string,
        abi: Array<ABIItem>
}

export type Network =
{
        name: string,
        id: number,
        hexID: string,
        explorer: string,
        availableContracts: Array<Contract> | null,
        rpcUrl: string
}
       