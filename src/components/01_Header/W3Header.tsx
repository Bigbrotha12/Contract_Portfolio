import React from 'react';
import { AppConnectionData, Network, Contract } from '../00_Common/Definitions';
import APIStatus from './components/APIStatus';
import Connector from './components/Connector';
import TestBalance from './components/TestBalance';
import Account from './components/Account';
import ContractSelector from './components/ContractSelector';
import NetworkSelector from './components/NetworkSelector';
import { Networks, Contracts } from "../../app/Networks";

import { ControllerContext } from '../../state/AppContext';
import IController from '../../app/IController';

export default function W3Header(props: {connection: AppConnectionData, setConnection: React.Dispatch<React.SetStateAction<AppConnectionData | null>>})
{
    const controller = React.useContext<IController>(ControllerContext); 
    
    const ContractCallback = (contract: Contract) => {
        console.log('Selected: ' + contract.name);
        props.setConnection({...props.connection, contract: contract});
    }

    const NetworkCallback = (network: Network) => {
        console.log('Selected: ' + network.name);
        props.setConnection({ ...props.connection, network: network });
    }

    async function WalletConnect()
    {
        
        let address = await controller.RequestConnection();
        let network = await controller.GetNetwork();
       
        console.log(network);
        if (address && network)
        {
            props.setConnection({...props.connection, account: address, network: network});
            console.log("Connected to account: " + address);
            console.log("Network ID: " + network.hexID);
        } else
        {
            console.log("Connection error. Account: " + address + "\nNetwork: " + network);    
        }
    }

    return (
        <div className='bg-white flex py-[12px] shadow-md'>
            <APIStatus connected={controller.ConnectionStatus() ? true : false} />
            <ContractSelector title='Contract' selected={props.connection?.contract} options={Contracts} callback={ContractCallback} />
            <div className='m-auto' />
            <TestBalance />
            <NetworkSelector title='Network' selected={props.connection?.network} options={Networks} callback={NetworkCallback} />
            {
                props.connection?.account ? <Account account={props.connection.account} /> : <Connector accountConnect={WalletConnect} />
            }
        </div>
    )
}
