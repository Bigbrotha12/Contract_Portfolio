import React from 'react';
import { Action } from '../../../app/Definitions';
import IController from '../../../app/IController';
import { Networks } from '../../../app/Networks';
import Material from '../../../assets/Material';
import { Error } from '../../../app/Errors';
import { ControllerContext } from '../../../state/AppContext';


export default function Connector(props: {setConnection: React.Dispatch<Action>})
{
    const controller = React.useContext<IController>(ControllerContext); 

    async function walletConnect()
    {
        let address = await controller.RequestConnection();
        let network = await controller.GetNetwork();
        if (address instanceof Error) {
            console.error("Connection error. Account: " + address.reason)
            return;
        }
        if (network instanceof Error) {
            console.error("Connection error. Network: " + network.reason)
            return;
        }
        
        props.setConnection({ type: "ACCOUNT_CHANGE", payload: address });
        props.setConnection({ type: "NETWORK_CHANGE", payload: network });
        
        window.ethereum.on("accountsChanged", handleAccountChange);
        window.ethereum.on("chainChanged", handleNetworkChange);
    }

    async function handleAccountChange() {
        let newAddress = await controller.RequestConnection();
        if (newAddress instanceof Error) {
            console.error("Connection error. Account: " + newAddress.reason)
            return;
        }
        
        props.setConnection({ type: "ACCOUNT_CHANGE", payload: newAddress });
    }

    async function handleNetworkChange(newNetwork) {
        let chosenNetwork = Array.from(Networks.values()).find(network => {
            return network.hexID === newNetwork;
        })
        if(chosenNetwork) props.setConnection({ type: "NETWORK_CHANGE", payload: chosenNetwork });
    }
    
    return (
        <div className='flex px-[32px]'>
            <Material.Button sx={{height: '60%', marginY: 'auto'}} onClick={walletConnect} variant='contained'>
                Connect
            </Material.Button>
        </div>
    )
}