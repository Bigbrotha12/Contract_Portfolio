import React from 'react';
import Material from '../../../assets/Material';
import { Action } from '../../../app/Definitions';

export default function EmptyContract(props: { setConnection: React.Dispatch<Action>, setInfoBanner: React.Dispatch<React.SetStateAction<{message: string, warning: string}>> }) {

    // Info Banner Update
    React.useEffect(() => {
        let infoMessage = "To start interacting with smart contracts, be sure to connect your Web3 wallet by clicking 'Connect' button, select a blockchain network, and choose a contract. \
        Most contracts use DEMO tokens, a simple ERC20 tokens you obtain for free by clicking on the DEMO token balance in the header and selecting 'Get DEMO Tokens'.";
        props.setInfoBanner(state => { return { ...state, message: infoMessage } });
    }, []);

    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="No Contract Selected." />
            <Material.CardContent>
                Please select a smart contract.    
            </Material.CardContent>
        </Material.Card>                
    )
}