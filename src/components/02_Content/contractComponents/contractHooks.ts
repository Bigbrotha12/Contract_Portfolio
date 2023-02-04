import React from "react";
import { NetworkName } from "../../../app/Definitions";
import IController from "../../../app/IController";
import { Contracts } from "../../../app/Networks";

export type AirdropData = { network: string, data: Array<{ to: string, amount: string }>};
type AirdropInterface = {
    claim(amount: string): Promise<void>,
    createAirdrop(data: AirdropData): Promise<void>,
    hasClaimed(address: string): Promise<boolean>,
    checkClaim(address: string): string
}
export const useAirdrop = (account: string, network: NetworkName, controller: IController): [string, boolean, AirdropInterface] => {
    
    const [airdropList, setAirdropList] = React.useState<AirdropData>();
    const [claimed, setClaimed] = React.useState<boolean>(false);
    const [amount, setAmount] = React.useState<string>('0');
    
    const airdrop = {
        async claim(amount: string): Promise<void> {
            let storage = localStorage.getItem("AirdropData");
            let storedData = storage ? JSON.parse(storage) : '';
            let data = airdropList || storedData as AirdropData;
            if (/^0x[a-fA-F0-9]{40}$/.test(account) && data) {
                controller.AirdropClaim(account, amount, data[network]);
            }
        },
        async createAirdrop(data: AirdropData): Promise<void> {
            if (await controller.AirdropNewRecipients(data[network])) {
                try {
                    let newState: AirdropData = airdropList ? { ...airdropList, [network]: data[network]} : data;
                    setAirdropList(newState);
                    localStorage.setItem("AirdropData", JSON.stringify(newState));
                } catch (error) {
                    console.error("Storage failed.");
                }
            }
        },
        async hasClaimed(address: string): Promise<boolean> {
            let status: boolean | null = await controller.AirdropHasClaimed(address);
            return status || false;
        },
        checkClaim(address: string): string {
            let storage = localStorage.getItem("AirdropData");
            let storedData = storage ? JSON.parse(storage) : '';
            let data = airdropList || storedData;
            let claimAmount = data.find(claim => claim.to === address)?.amount!;
            return claimAmount || '0';
        }
    }

    function handleClaim(event) {
        console.log(event);
    }

    React.useEffect(() => {
        (async function checkStatus() {
            try {
                let storage = localStorage.getItem("AirdropData");
                let storedData = storage ? JSON.parse(storage) : '';
                if (!airdropList && storedData) { setAirdropList(storedData); }
                let data = airdropList || storedData;
                if (/^0x[a-fA-F0-9]{40}$/.test(account) && data) {
                    setAmount(airdrop.checkClaim(account));
                    setClaimed(await airdrop.hasClaimed(account));
                }
            } catch (error) {
                console.error(error);
            }
        })();
        controller.Subscribe(Contracts.get("Airdrop")!, "Claimed", handleClaim);

        return (() => 
            controller.Unsubscribe(Contracts.get("Airdrop")!, "Claimed", handleClaim)
        )
    }, [account, network]);
    return [amount, claimed, airdrop];
}

type TestTokenInterface = {
    faucet(): Promise<void>,
    balance(address?: string): Promise<string>
}
export const useTestToken = (account: string, network: NetworkName, controller: IController): [string, TestTokenInterface] => {
    
    const [amount, setAmount] = React.useState<string>('0');
    
    const testToken: TestTokenInterface = {
        async faucet(): Promise<void> {
            await controller.GetTestTokens();
        },
        async balance(address?: string): Promise<string> {
            return await controller.GetTestTokenBalance() || "0";
        },
    }

    function handleTransfer(e) {
        console.log(e);
    }

    React.useEffect(() => {
        (async function checkBalance() {
            let balance = await testToken.balance(account);
            console.log(balance);
            setAmount(balance);
        })();
        controller.Subscribe(Contracts.get("Token")!, "Transfer", handleTransfer);

        return (() => 
            controller.Unsubscribe(Contracts.get("Token")!, "Transfer", handleTransfer)
        )
    }, [account, network]);
    return [amount, testToken];
}