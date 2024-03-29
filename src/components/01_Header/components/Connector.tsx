import React from 'react';
import { Action } from '../../../app/Definitions';
import IController from '../../../app/IController';
import { Networks } from '../../../app/Networks';
import Material from '../../../assets/Material';
import { ControllerContext } from '../../../state/AppContext';
import MetamaskIcon from '../../../assets/icons/metamask.png';
import EtherIcon from '../../../assets/icons/ethersjs.png';


export default function Connector(props: {setConnection: React.Dispatch<Action>})
{
    const controller = React.useContext<IController>(ControllerContext);
    const [openModal, setOpenModal] = React.useState<boolean>(false);

    function walletCreate() {
        // Check if wallet already exist in local storage
        let data: string = '';
        let cachedWallet = localStorage.getItem("mnemonic");
        if (cachedWallet) {
            let [error, walletAddress] = controller.GetWalletAddress(cachedWallet);
            if (walletAddress) {
                props.setConnection({ type: "ACCOUNT_CHANGE", payload: walletAddress });
                props.setConnection({ type: "FALLBACK_WALLET", payload: cachedWallet });
            } else if (error) {
                console.error(error.reason);
            }
        // Otherwise create one and stored it.
        } else {
            let [error, wallet] = controller.CreateWallet();
            if (wallet) {
                
                props.setConnection({ type: "ACCOUNT_CHANGE", payload: wallet.address });
                props.setConnection({ type: "FALLBACK_WALLET", payload: wallet.mnemonic });
                localStorage.setItem("mnemonic", wallet.mnemonic);
            } else if (error) {
                console.error(error);
            } 
        }        
        console.warn("App starting in fallback mode.");
    }

    async function walletConnect() {

        if (!window.ethereum.isMetaMask) {
            setOpenModal(true);
            return;
        }
        let [errorA, address] = await controller.RequestConnection();
        let [errorN, network] = await controller.GetNetwork();
        if (errorA) {
            if(errorA.code === 11) setOpenModal(true);
            console.error("Connection error. Account: " + errorA.reason);
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
            
           <Material.Modal open={openModal}>
                <Material.Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'white',
                        borderRadius: '12px',
                        padding: '2rem'
                    }}>
                    <div className='flex justify-between p-3'>
                        <p>Choose Option</p>
                        <button onClick={() => setOpenModal(false)}><Material.Close /></button>
                    </div>
                    
                    <WalletOption
                        icon={MetamaskIcon}
                        walletName='Metamask'
                        description='Connect using browser wallet'
                        callback={walletConnect} />
                    <WalletOption
                        icon={EtherIcon}
                        walletName='Burner Wallet'
                        description='Generate burner test wallet'
                        callback={walletCreate} />
            </Material.Box>
        </Material.Modal>
        </div>
    )
}

function WalletOption(props: {icon: string, walletName: string, description: string, callback: () => void}): JSX.Element {

    return (
        <div className='flex rounded-md border-[1px] p-[1rem] justify-between gap-3' >
            <img className='aspect-square max-w-[32px] max-h-[32px] my-auto' src={props.icon} width='auto' height='auto' />
            <div>
                <p className='text-lg'>{props.walletName}</p>
                <p>{props.description}</p>
            </div>
            <Material.Button startIcon={<Material.ArrowForward />} onClick={props.callback} />
        </div>
    );
}