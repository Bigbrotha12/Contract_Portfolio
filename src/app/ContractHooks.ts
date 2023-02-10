import React from "react";
import { Network, NetworkName, Web3Transaction } from "./Definitions";
import IController from "./IController";
import { Networks } from "./Networks";

export type AirdropData = Map<NetworkName, Array<{ to: string, amount: string }>>;
type AirdropInterface = {
    claim(amount: string): Promise<void>,
    createAirdrop(data: Array<{ to: string, amount: string }>): Promise<void>,
    hasClaimed(address: string): Promise<boolean>,
    checkAddress(address: string): string
}
export const useAirdrop = (account: string, network: NetworkName, controller: IController): [string, boolean, AirdropInterface, Map<string, Web3Transaction>] => {
    
    const [airdropList, setAirdropList] = React.useState<AirdropData>();
    const [claimed, setClaimed] = React.useState<boolean>(false);
    const [amount, setAmount] = React.useState<string>('0');
    const [transactions, setTransactions] = React.useState<Map<string, Web3Transaction>>(new Map<string, Web3Transaction>());
    const updateAirdropList = (key: NetworkName, value: Array<{ to: string, amount: string }>) => {
        let entry: Map<NetworkName, Array<{to: string, amount: string}>> = airdropList ? new Map(airdropList) : new Map<NetworkName, Array<{to: string, amount: string}>>();
        let updatedEntry = entry.set(key, value);
        setAirdropList(updatedEntry);
        localStorage.setItem("AirdropData", JSON.stringify(Array.from(updatedEntry.entries())));
    }
    const airdrop = {
        async claim(creator: string): Promise<void> {
            let data: AirdropData | null = null;
            if (airdropList) {
                data = airdropList;
            } else {
                let storage = localStorage.getItem("AirdropData");
                let storedData = storage ? new Map<NetworkName, Array<{ to: string, amount: string }>>(JSON.parse(storage)) : null;
                if (storedData) {
                    setAirdropList(storedData);
                    data = storedData;
                }
            }
            
            if (data && data.get(network) && /^0x[a-fA-F0-9]{40}$/.test(creator)) {
                await controller.AirdropClaim(creator, account, amount, data.get(network)!, transactionWatcher);
            } else {
                console.error("Claim attempt failed due to invalid parameters. Ensure your airdrop list has been set for the current network.");
            }
        },
        async createAirdrop(data: Array<{ to: string, amount: string }>): Promise<void> {
            let localAirdrop: Array<{ to: string, amount: string }> = data;
            if (localAirdrop) {
                await controller.AirdropNewRecipients(localAirdrop, transactionWatcher);
                try { updateAirdropList(network, localAirdrop); }
                catch (error) { console.error(error); }
            }
        },
        async hasClaimed(address: string): Promise<boolean> {
            let status: boolean | null = await controller.AirdropHasClaimed(address);
            return status || false;
        },
        checkAddress(address: string): string {
            let data: AirdropData | null = null;
            if (airdropList) {
                console.log("Airdrop state found.");
                data = airdropList;
            } else {
                console.log("Airdrop state not found. Searching within local context.");
                let storage: string | null = localStorage.getItem("AirdropData");
                let storedData = storage ? new Map<NetworkName, Array<{ to: string, amount: string }>>(JSON.parse(storage)) : null;
                if (storedData) {
                    console.log("Airdrop data found. Loading state.");
                    setAirdropList(storedData);
                    data = storedData;
                } else {
                    console.log("No airdrop data found.");
                }
            }
            
            if (data && data.get(network) && /^0x[a-fA-F0-9]{40}$/.test(address)) {
                return data.get(network)?.find(entry => entry.to === address)?.amount || "0";
            } else {
                return "0";
            }
        }
    }

    function transactionWatcher(hash: string, transaction: Web3Transaction): void {
        if (transaction) {
            let newState = new Map(transactions);
            setTransactions(newState.set(hash, transaction));
        }
    }

    React.useEffect(() => {
        (async () => {
            if (account && network) {
                let amountChecked = airdrop.checkAddress(account);
                console.log(amountChecked);
                setAmount(amountChecked);
                setClaimed(await airdrop.hasClaimed(account));
            }  
        })();
        
    }, [account, network, transactions]);
    return [amount, claimed, airdrop, transactions];
}

type TestTokenInterface = {
    faucet(): Promise<void>,
    balance(address?: string): Promise<string>
}
export const useTestToken = (account: string, network: NetworkName, controller: IController): [string, TestTokenInterface] => {
    
    const [amount, setAmount] = React.useState<string>('0');
    const [transactions, setTransactions] = React.useState<Map<string, Web3Transaction>>(new Map<string, Web3Transaction>());
    
    const testToken: TestTokenInterface = {
        async faucet(): Promise<void> {
            await controller.GetTestTokens();
        },
        async balance(address?: string): Promise<string> {
            return await controller.GetTestTokenBalance() || "0";
        }
    }

    function transactionWatcher(hash: string, transaction: Web3Transaction): void {
        if (transaction) {
            let newState = new Map(transactions);
            setTransactions(newState.set(hash, transaction));
        }
    }

    React.useEffect(() => {
        (async function checkBalance() {
            let balance = await testToken.balance(account);
            setAmount(balance);
        })();
        
    }, [account, network]);
    return [amount, testToken];
}

type CoinFlipperInterface = {
    placeBet(amount: string): Promise<void>;
    flipCoin(): Promise<void>;
    withdrawFunds(amount: string): Promise<void>;
    checkBalance(address: string): Promise<string>;
}
export enum WinState {
    NONE,
    WON,
    LOST
}
export const useFlipper = (account: string, network: NetworkName, controller: IController): [string | undefined, WinState, CoinFlipperInterface, Map<string, Web3Transaction>] => {
    const [funds, setFunds] = React.useState<string>();
    const [winState, setWinState] = React.useState<WinState>(WinState.NONE);
    const [transactions, setTransactions] = React.useState<Map<string, Web3Transaction>>(new Map<string, Web3Transaction>());
    
    const coinFlipper: CoinFlipperInterface = {
        async placeBet(amount: string): Promise<void> {
            try { await controller.FlipperAddFunds(amount, transactionWatcher) }
            catch (error) { console.error(error) }
        },
        async flipCoin(): Promise<void> {
            try { await controller.FlipperFlipCoin(transactionWatcher) }
            catch (error) { console.error(error) }
        },
        async withdrawFunds(amount: string): Promise<void> {
            try { await controller.FlipperWithdrawFunds(amount, transactionWatcher) }
            catch (error) { console.error(error) }
        },
        async checkBalance(): Promise<string> {
            let balance = await controller.FlipperCheckFunds();
            return balance || "0";
        }
    }

    function transactionWatcher(hash: string, transaction: Web3Transaction): void {
        if (transaction) {
            let newState = new Map(transactions);
            setTransactions(newState.set(hash, transaction));
        }
    }

    React.useEffect(() => {
       // check user funds whenever account, network, or transactions change.
        (async () => {
            let balance = await coinFlipper.checkBalance(account);
            if (balance) {
                if (funds && parseInt(balance) > parseInt(funds)) {
                    setWinState(WinState.WON);
                } else if (funds && parseInt(balance) < parseInt(funds)) {
                    setWinState(WinState.LOST);
                }
                setFunds(balance);
            }
        })();
    }, [account, network, transactions]);

    return [funds, winState, coinFlipper, transactions];
}

type BridgeInterface = {
    checkChainNonce(network: Network): Promise<boolean>;
    prepareSendTransaction(destNetwork: Network, amount: string): Promise<void>;
    completeSendTransaction(): Promise<void>;
}
export const useBridge = (account: string, network: NetworkName, controller: IController): [BridgeInterface, Map<string, Web3Transaction>] => {

    const [transactions, setTransactions] = React.useState<Map<string, Web3Transaction>>(new Map<string, Web3Transaction>());
    
    const bridge: BridgeInterface = {
        async checkChainNonce(destNetwork: Network): Promise<boolean> {
            return await controller.BridgeCheckNonce(destNetwork) || false;
        },
        async prepareSendTransaction(destNetwork: Network, amount: string): Promise<void> {
            await controller.BridgeSendTx(destNetwork, amount, transactionWatcher) 
        },
        async completeSendTransaction(): Promise<void> {
            await controller.FlipperFlipCoin(transactionWatcher)
        }
    }

    function transactionWatcher(hash: string, transaction: Web3Transaction): void {
        if (transaction) {
            let newState = new Map(transactions);
            setTransactions(newState.set(hash, transaction));
        }
    }

    React.useEffect(() => {
       // check pending transactions whenever account, network, or transactions change.
        (async () => {
           
        })();
    }, [account, network, transactions]);

    return [bridge, transactions];
}

type NFTTokenInterface = {
    mint(address: string): Promise<void>;
    transfer(tokenId: string, recipient: string): Promise<void>;
    checkOwner(tokenId: string): Promise<string>;
}
export const useNFTToken = (account: string, network: NetworkName, controller: IController): [string, NFTTokenInterface, Map<string, Web3Transaction>] => {
    const [userBalance, setUserBalance] = React.useState<string>("0");
    const [transactions, setTransactions] = React.useState<Map<string, Web3Transaction>>(new Map<string, Web3Transaction>);
    const NFTToken: NFTTokenInterface = {
        async mint(address: string): Promise<void> {
        },
        transfer: function (tokenId: string, recipient: string): Promise<void> {
            throw new Error("Function not implemented.");
        },
        checkOwner: function (tokenId: string): Promise<string> {
            throw new Error("Function not implemented.");
        }
    }

    function transactionWatcher(hash: string, transaction: Web3Transaction): void {
        if (transaction) {
            let newState = new Map(transactions);
            setTransactions(newState.set(hash, transaction));
        }
    }

    React.useEffect(() => {

    }, [account, network, transactions])

    return [userBalance, NFTToken, transactions];
}

type ReflectInterface = {
    purchase(amount: string): Promise<void>;
    transfer(recipient: string, amount: string): Promise<void>;
    checkBalance(address: string): Promise<string>;
}
export const useReflect = (account: string, network: NetworkName, controller: IController): [string, string, ReflectInterface, Map<string, Web3Transaction>] => {
    const [userBalance, setUserBalance] = React.useState<string>("0");
    const [price, setPrice] = React.useState<string>("0");
    const [transactions, setTransactions] = React.useState<Map<string, Web3Transaction>>(new Map<string, Web3Transaction>);
    const reflect: ReflectInterface = {
        async purchase(amount: string): Promise<void> {
        },
        transfer: function (recipient: string, amount: string): Promise<void> {
            throw new Error("Function not implemented.");
        },
        checkBalance: function (address: string): Promise<string> {
            throw new Error("Function not implemented.");
        }
    }

    function transactionWatcher(hash: string, transaction: Web3Transaction): void {
        if (transaction) {
            let newState = new Map(transactions);
            setTransactions(newState.set(hash, transaction));
        }
    }

    React.useEffect(() => {
        (async () => {
            setUserBalance(await controller.ReflectBalance(account) || "0");
            setPrice(await controller.ReflectGetPrice() || "0");
        })();
    }, [account, network, transactions])

    return [userBalance, price, reflect, transactions];
}

type StakerInterface = {
    stakeTokens(amount: string): Promise<void>;
    claimReward(): Promise<void>;
    withdrawStake(amount?: string): Promise<void>;
}
export const useStaker = (account: string, network: NetworkName, controller: IController): [string, string, StakerInterface, Map<string, Web3Transaction>] => {
    const [userBalance, setUserBalance] = React.useState<string>("0");
    const [rewardBalance, setRewardBalance] = React.useState<string>("0");
    const [transactions, setTransactions] = React.useState<Map<string, Web3Transaction>>(new Map<string, Web3Transaction>());
    const Staker: StakerInterface = {
        async stakeTokens(amount: string): Promise<void> {
            await controller.StakeAddFunds(amount);
        },
        async claimReward(): Promise<void> {
            await controller.StakeClaimReward();
        },
        async withdrawStake(amount?: string): Promise<void> {
            await controller.StakeWithdrawFunds(amount || userBalance);
        }
    }

    function transactionWatcher(hash: string, transaction: Web3Transaction): void {
        if (transaction) {
            let newState = new Map(transactions);
            setTransactions(newState.set(hash, transaction));
        }
    }

    React.useEffect(() => {
        (async () => {
            setUserBalance(await controller.StakeCheckStake() || "0");
            setRewardBalance(await controller.StakeCheckReward() || "0");
        })();
    }, [account, network, transactions]);

    return [userBalance, rewardBalance, Staker, transactions];
}