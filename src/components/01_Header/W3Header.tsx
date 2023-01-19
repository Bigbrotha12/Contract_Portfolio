import React from 'react';
import { AppConnectionData, Network, Contract } from '../00_Common/Definitions';
import APIStatus from './components/APIStatus';
import Connector from './components/Connector';
import TestBalance from './components/TestBalance';
import Account from './components/Account';
import ContractSelector from './components/ContractSelector';
import NetworkSelector from './components/NetworkSelector';
import { Networks, Contracts } from "../../app/Networks";

import { ConnectionContext, ControllerContext } from '../../state/AppContext';
import IController from '../../app/IController';

export default function W3Header(props: {setConnection: React.Dispatch<React.SetStateAction<AppConnectionData>>})
{
    const controller = React.useContext<IController>(ControllerContext); 
    const connection: AppConnectionData = React.useContext(ConnectionContext);

    const ContractCallback = (contract: Contract) => {
        console.log('Selected: ' + contract.name);
        props.setConnection({...connection, contract: contract});
    }

    const NetworkCallback = (network: Network) => {
        console.log('Selected: ' + network.name);
        props.setConnection({ ...connection, network: network });
    }

    async function WalletConnect()
    {
        
        let address = await controller.RequestConnection();
        let network = await controller.GetNetwork();
       
        console.log(network);
        if (address && network)
        {
            props.setConnection({...connection, account: address, network: network});
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
            <ContractSelector title='Contract' selected={connection?.contract} options={Contracts} callback={ContractCallback} />
            <div className='m-auto' />
            <TestBalance />
            <NetworkSelector title='Network' selected={connection?.network} options={Networks} callback={NetworkCallback} />
            {
                connection?.account ? <Account account={connection.account} /> : <Connector accountConnect={WalletConnect} />
            }
        </div>
    )
}
