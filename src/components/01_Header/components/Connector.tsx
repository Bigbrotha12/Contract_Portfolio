import React from 'react';
import { Action } from '../../../app/Definitions';
import IController from '../../../app/IController';
import Material from '../../../assets/Material';
import { ControllerContext } from '../../../state/AppContext';


export default function Connector(props: {setConnection: React.Dispatch<Action>})
{
    const controller = React.useContext<IController>(ControllerContext); 

    async function walletConnect()
    {
        let address = await controller.RequestConnection();
        let network = await controller.GetNetwork();

        if (address && network) {
            props.setConnection({ type: "ACCOUNT_CHANGE", payload: address });
            props.setConnection({ type: "NETWORK_CHANGE", payload: network });
        } else {
            console.log("Connection error. Account: " + address + "\nNetwork: " + network);    
        }
    }
    
    return (
        <div className='flex px-[32px]'>
            <Material.Button sx={{height: '60%', marginY: 'auto'}} onClick={walletConnect} variant='contained'>
                Connect
            </Material.Button>
        </div>
    )
}