import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from "./Components/Header";
import React from "react";
import Body from './Components/Body';
import Web3Wallet from './API/Web3Wallet';
import { Contract } from './Constants/Web3Types';

type AppState = {
    wallet: Web3Wallet,
    contract: Contract
}

export default function App() {
    const queryClient = new QueryClient();
    const [wallet, setWallet] = React.useState({});
    const [contract, setContract] = React.useState({});
 
    return (
        <React.StrictMode>
            <Header walletState={wallet} walletSetting={setWallet}/>
            <QueryClientProvider client={queryClient} >
                <Body contractState={contract} contractSetting={setContract} />
            </QueryClientProvider>
        </React.StrictMode>
    ) 
}


