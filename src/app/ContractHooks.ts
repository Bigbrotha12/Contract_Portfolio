import { ethers } from "ethers";
import React from "react";
import { Contract, Network, NetworkName, TransactionStatus, Web3Transaction } from "./Definitions";
import { Error } from "./Errors";
import IController from "./IController";
import { Contracts, Networks } from "./Networks";

export type AirdropData = Map<NetworkName, Array<{ to: string, amount: string }>>;
type AirdropInterface = {
    claim(amount: string): Promise<void>,
    createAirdrop(data: Array<{ to: string, amount: string }>): Promise<void>,
    hasClaimed(address: string): Promise<boolean>,
    checkAddress(address: string): string
}
export const useAirdrop = (account: string, network: NetworkName, controller: IController): [string, boolean, AirdropInterface, Map<string, Web3Transaction>, string] => {
    
    const [airdropList, setAirdropList] = React.useState<AirdropData>();
    const [claimed, setClaimed] = React.useState<boolean>(false);
    const [amount, setAmount] = React.useState<string>('0');
    const [error, setError] = React.useState<string>("");
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
                let tx = await controller.AirdropClaim(creator, account, amount, data.get(network)!, transactionWatcher);
                if (tx instanceof Error) { setError(tx.reason); }
            } else {
                setError("Claim attempt failed due to invalid parameters. Ensure your airdrop list has been set for the current network.");
            }
        },
        async createAirdrop(data: Array<{ to: string, amount: string }>): Promise<void> {
            let localAirdrop: Array<{ to: string, amount: string }> = data;
            if (localAirdrop) {
                let tx = await controller.AirdropNewRecipients(localAirdrop, transactionWatcher);
                if (tx instanceof Error) {
                    setError(tx.reason);
                    return;
                }

                try { updateAirdropList(network, localAirdrop); }
                catch (error) { setError("Unable to store airdrop data."); }
            }
        },
        async hasClaimed(address: string): Promise<boolean> {
            let status: boolean | Error = await controller.AirdropHasClaimed(address);
            if (status instanceof Error) {
                setError(status.reason);
                return false;
            }
            return status;
        },
        checkAddress(address: string): string {
            let data: AirdropData | null = null;
            if (airdropList) {
                data = airdropList;
            } else {
                let storage: string | null = localStorage.getItem("AirdropData");
                let storedData = storage ? new Map<NetworkName, Array<{ to: string, amount: string }>>(JSON.parse(storage)) : null;
                if (storedData) {
                    setAirdropList(storedData);
                    data = storedData;
                }
            }
            
            if (data && data.get(network) && /^0x[a-fA-F0-9]{40}$/.test(address)) {
                return data.get(network)!.find(entry => entry.to === address)?.amount || "0";
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
    return [amount, claimed, airdrop, transactions, error];
}

type TestTokenInterface = {
    faucet(): Promise<void>,
    balance(address?: string): Promise<string>
}
export const useTestToken = (account: string, network: NetworkName, controller: IController): [string, TestTokenInterface, Map<string, Web3Transaction>, string] => {
    
    const [amount, setAmount] = React.useState<string>('0');
    const [error, setError] = React.useState<string>("");
    const [transactions, setTransactions] = React.useState<Map<string, Web3Transaction>>(new Map<string, Web3Transaction>());
    
    const testToken: TestTokenInterface = {
        async faucet(): Promise<void> {
            let tx = await controller.GetTestTokens(transactionWatcher);
            if (tx instanceof Error) { setError(tx.reason); }
        },
        async balance(address?: string): Promise<string> {
            let balance = await controller.GetTestTokenBalance();
            if (balance instanceof Error) {
                setError(balance.reason);
                return "0";
            }
            return formatAmount(balance, 2);
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
        
    }, [account, network, transactions]);

    return [amount, testToken, transactions, error];
}

type CoinFlipperInterface = {
    placeBet(amount: string): Promise<void>;
    flipCoin(): Promise<void>;
    withdrawFunds(amount: string): Promise<void>;
}
export enum WinState {
    NONE,
    WON,
    LOST
}
export const useFlipper = (account: string, network: NetworkName, controller: IController): [string | undefined, WinState, CoinFlipperInterface, Map<string, Web3Transaction>, string] => {
    const [funds, setFunds] = React.useState<string>("0");
    const [winState, setWinState] = React.useState<WinState>(WinState.NONE);
    const [error, setError] = React.useState<string>("");
    const [transactions, setTransactions] = React.useState<Map<string, Web3Transaction>>(new Map<string, Web3Transaction>());
    
    const coinFlipper: CoinFlipperInterface = {
        async placeBet(amount: string): Promise<void> {
            let tx = await controller.FlipperAddFunds(amount, transactionWatcher);
            if (tx instanceof Error) { setError(tx.reason); }
        },
        async flipCoin(): Promise<void> {
            let tx = await controller.FlipperFlipCoin(transactionWatcher);
            if (tx instanceof Error) {
                setError(tx.reason);
                return;
            }
            winStatePolling();
        },
        async withdrawFunds(amount: string): Promise<void> {
            let tx = await controller.FlipperWithdrawFunds(amount, transactionWatcher);
            if (tx instanceof Error) { setError(tx.reason); }
        }
    }

    async function winStatePolling() {
        let newBalance = await controller.FlipperCheckFunds();
        if (!(newBalance instanceof Error)) {
            let balanceInt = parseInt(newBalance);
            let fundsInt = parseInt(funds);
            if (balanceInt > fundsInt) {
                console.log("Setting Win state to WON.");
                setWinState(WinState.WON);
            } else if (balanceInt < fundsInt) {
                console.log("Setting Win state to LOST.");
                setWinState(WinState.LOST);
            }
            if (parseInt(newBalance) == parseInt(funds)) {
                setTimeout(winStatePolling, 5000);
            }
            setFunds(newBalance);
        } else {
            setError(newBalance.reason);
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
            let balance = await controller.FlipperCheckFunds();
            if (!(balance instanceof Error)) { setFunds(formatAmount(balance, 2)); }
            else { setError(balance.reason); }
        })();
    }, [account, network, transactions]);

    return [funds, winState, coinFlipper, transactions, error];
}

type BridgeInterface = {
    prepareSendTransaction(destNetwork: Network, amount: string): Promise<void>;
    completeSendTransaction(): Promise<void>;
}
export const useBridge = (account: string, network: NetworkName, controller: IController): [Map<NetworkName, { source: number, nonce: string }>, BridgeInterface, Map<string, Web3Transaction>, string] => {

    const [pendingNonces, setPendingNonces] = React.useState<Map<NetworkName, { source: number, nonce: string }>>(new Map<NetworkName, { source: number, nonce: string }>());
    const [error, setError] = React.useState<string>("");
    const [transactions, setTransactions] = React.useState<Map<string, Web3Transaction>>(new Map<string, Web3Transaction>());
    
    const bridge: BridgeInterface = {
        async prepareSendTransaction(destNetwork: Network, amount: string): Promise<void> {
            let tx = await controller.BridgeSendTx(destNetwork.id, amount, transactionWatcher);
            if (tx instanceof Error) { setError(tx.reason); }
        },
        async completeSendTransaction(): Promise<void> {
            let sender = pendingNonces.get(network)!;
            let tx = await controller.BridgeCompleteTransfer(sender.source, sender.nonce, transactionWatcher);
            if (tx instanceof Error) { setError(tx.reason); }
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
        // check every network for pending transactions
        if (!pendingNonces.get(network)) {
            Contracts.get("Bridge")!.instances.find(async instance => {
                let chain = Networks.get(instance.network)!;
                let pendingNonce = await controller.BridgeGetPending(chain.name, chain.rpcUrl);
                if (pendingNonce instanceof Error) {
                    setError(pendingNonce.reason);
                    return false;
                }

                if (pendingNonce != "") {
                    let newState = new Map(pendingNonces);
                    setPendingNonces(newState.set(network, { source: chain.id, nonce: pendingNonce }));
                    return true;
                }
            });
        }
    }, [account, network, transactions]);

    return [pendingNonces, bridge, transactions, error];
}

type NFTTokenInterface = {
    mint(message: string): Promise<void>;
    transfer(tokenId: string, recipient: string): Promise<void>;
    checkOwner(tokenId: string): Promise<string>;
}
export const useNFTToken = (account: string, network: NetworkName, controller: IController): [string, Array<{id: string, url: string, message: string}>, NFTTokenInterface, Map<string, Web3Transaction>] => {
    const [userBalance, setUserBalance] = React.useState<string>("0");
    const [userTokens, setUserTokens] = React.useState<Array<{id: string, url: string, message: string}>>([]);
    const [transactions, setTransactions] = React.useState<Map<string, Web3Transaction>>(new Map<string, Web3Transaction>);
    const NFTToken: NFTTokenInterface = {
        async mint(message: string): Promise<void> {
            await controller.NFTMint(message, transactionWatcher);
        },
        async transfer(tokenId: string, recipient: string): Promise<void> {
            await controller.NFTTransfer(recipient, tokenId, transactionWatcher);
        },
        async checkOwner(tokenId: string): Promise<string> {
            return await controller.NFTGetOwner(tokenId) || '';
        }
    }

    function transactionWatcher(hash: string, transaction: Web3Transaction): void {
        if (transaction) {
            let newState = new Map(transactions);
            setTransactions(newState.set(hash, transaction));
        }
    }

    React.useEffect(() => {
        // Check NFTs owned by user, fetch message and image.
        (async () => {
            let balance = await controller.NFTBalance(account);
            if (balance) { setUserBalance(balance); }
            let tokens: Array<string> | null = await controller.NFTFetchAll(account);
            if (tokens) {
                let metadata: Array<{ id: string, url: string, message: string }> = [];
                tokens.forEach(async token => {
                    let data = await controller.NFTGetMetadata(token);
                    if (data) { metadata.push({ id: token, url: data.url, message: data.message }); }
                });
                setUserTokens(metadata);
            }
        })();
    }, [account, network, transactions]);

    return [userBalance, userTokens, NFTToken, transactions];
}

type ReflectInterface = {
    purchase(amount: string): Promise<void>;
    transfer(recipient: string, amount: string): Promise<void>;
}
export const useReflect = (account: string, network: NetworkName, controller: IController): [string, string, ReflectInterface, Map<string, Web3Transaction>] => {
    const [userBalance, setUserBalance] = React.useState<string>("0");
    const [price, setPrice] = React.useState<string>("0");
    const [transactions, setTransactions] = React.useState<Map<string, Web3Transaction>>(new Map<string, Web3Transaction>);
    const reflect: ReflectInterface = {
        async purchase(amount: string): Promise<void> {
            await controller.ReflectGetToken(amount, transactionWatcher);
        },
        async transfer(recipient: string, amount: string): Promise<void> {
            await controller.ReflectTransfer(recipient, amount, transactionWatcher);
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
            let balance = await controller.ReflectBalance(account);
            let price = await controller.ReflectGetPrice();
            if(balance) setUserBalance(formatAmount(balance, 2));
            if(price) setPrice(formatAmount(price, 2));
        })();
    }, [account, network, transactions]);

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
            await controller.StakeAddFunds(amount, transactionWatcher);
        },
        async claimReward(): Promise<void> {
            await controller.StakeClaimReward(transactionWatcher);
        },
        async withdrawStake(amount?: string): Promise<void> {
            await controller.StakeWithdrawFunds(amount || userBalance, transactionWatcher);
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
            let uBalance = await controller.StakeCheckStake();
            let rBalance = await controller.StakeCheckReward();
            if(uBalance) setUserBalance(formatAmount(uBalance, 2));
            if(rBalance) setRewardBalance(formatAmount(rBalance, 2));
        })();
    }, [account, network, transactions]);

    return [userBalance, rewardBalance, Staker, transactions];
}

function formatAmount(amount: string, decimals: number): string
{
    let decimalIndex = amount.indexOf(".");
    if (decimalIndex <= 0) { return amount; }
    
    let desiredLength = decimalIndex + decimals + 1;
    return amount.length > desiredLength ? amount.substring(0, desiredLength) : amount;
}