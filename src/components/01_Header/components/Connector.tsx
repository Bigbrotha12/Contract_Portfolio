import React from 'react';
import { AppConnectionData } from '../../../app/Definitions';
import IController from '../../../app/IController';
import Material from '../../../assets/Material';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';


export default function Connector(props: {setConnection: React.Dispatch<React.SetStateAction<AppConnectionData>>})
{
    const controller = React.useContext<IController>(ControllerContext); 
    const connection = React.useContext<AppConnectionData>(ConnectionContext);

    async function walletConnect()
    {
        let address = await controller.RequestConnection();
        let network = await controller.GetNetwork();

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
        <div className='flex px-[32px]'>
            <Material.Button sx={{height: '60%', marginY: 'auto'}} onClick={walletConnect} variant='contained'>
                Connect
            </Material.Button>
        </div>
    )
}