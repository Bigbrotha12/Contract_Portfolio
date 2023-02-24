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
        let [errorA, address] = await controller.RequestConnection();
        let [errorN, network] = await controller.GetNetwork();
        if (errorA) {
            console.error("Connection error. Account: " + errorA.reason)
            return;
        } else if (address) {
            props.setConnection({ type: "ACCOUNT_CHANGE", payload: address });
        }
        if (errorN) {
            console.error("Connection error. Network: " + errorN.reason)
            return;
        } else if (network) {
            props.setConnection({ type: "NETWORK_CHANGE", payload: network });
        }
        window.ethereum.on("accountsChanged", handleAccountChange);
        window.ethereum.on("chainChanged", handleNetworkChange);
    }

    async function handleAccountChange() {
        let [error, newAddress] = await controller.RequestConnection();
        if (error) {
            console.error("Connection error. Account: " + error.reason)
            return;
        } else if (newAddress) {
            props.setConnection({ type: "ACCOUNT_CHANGE", payload: newAddress });
        }
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
            <FallbackWalletCreator open={false} />
        </div>
    )
}

function FallbackWalletCreator(props: {open: boolean}): JSX.Element {
    return (
        <Material.Modal open={props.open}>
            <Material.Box>
                You do not have a wallet installed. But do not dispair!
                You can get a free, virus-free wallet here.
                Or I can create a one-time wallet for you to interact with blockchain.
            </Material.Box>
        </Material.Modal>
    );
}