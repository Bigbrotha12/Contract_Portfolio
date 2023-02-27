import React from 'react';
import Material from '../../../assets/Material';
import { Networks } from '../../../app/Networks';
import { Action, AppConnectionData, Network } from '../../../app/Definitions';
import IController from '../../../app/IController';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import { useBridge } from '../../../app/ContractHooks';

type BridgeTx = {
    amount: string,
    network: Network
}
export default function Bridge(props: { setConnection: React.Dispatch<Action>, setInfoBanner: React.Dispatch<React.SetStateAction<{ message: string, warning: string }>> }) {
    const [transferTx, setTransferTx] = React.useState<BridgeTx>({ amount: '0', network: Networks.get('Not Connected')! });
    const controller: IController = React.useContext(ControllerContext);
    const connection: AppConnectionData = React.useContext(ConnectionContext);
    const [pendingTx, bridge, transactions, error] = useBridge(connection.account, connection.network.name, controller, connection.walletMnemonics);
    
    function handleNetworkSelection(event) {
        let dest: Network = Networks.get(event.target.value)!;
        console.log(dest);
        console.log(event.target.value);
        setTransferTx(state => { return { ...state, network: dest } });
    }

    // Event Tracker Update
    React.useEffect(() => {
        props.setConnection({ type: "ADD_TRANSACTION", payload: transactions });
    }, [transactions]);

    // Info Banner Update
    React.useEffect(() => {
        let infoMessage = "This is a blockchain bridge contract. It allows you to transfer DEMO tokens across blockchain networks. \
        You can select the amount of tokens to transfer, and the destination network. After the transaction is processed, you will \
        be able to claim the tokens in the destination network. This implementation uses EIP712 for domain validation and verification and a simple relay server to communicate across networks.";
        props.setInfoBanner(state => { return { ...state, message: infoMessage } });
    }, []);
    React.useEffect(() => {
        props.setInfoBanner(state => { return { ...state, warning: error } });
    }, [error]);

    return (
        <Material.Card sx={{margin: "12px"}}>
            <div className='flex justify-between'>
            <Material.CardHeader title="Bridge Contract" />
            <Material.Link
                    sx={{ padding: '12px' }}
                    onClick={() => window.open('https://github.com/Bigbrotha12/Contract_Portfolio/blob/master/contracts/contracts/C_IBC_Messenger/IBC_Bridge.sol')?.focus()}
                >View Source Code</Material.Link>
            </div>
            <Material.CardContent>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{ paddingTop: '12px' }}>Token Transfer Bridge</Material.Typography>
                        <Material.Divider />
                    </div>
                    
                    <div className='pb-[12px]'>
                    {pendingTx.get(connection.network.name) ? 
                        <Material.Button onClick={bridge.completeSendTransaction}>
                            <Material.Typography>
                                You have a pending transaction to complete.
                            </Material.Typography>
                        </Material.Button> :
                        <Material.Typography></Material.Typography>
                    }
                    </div>
                    <div className='pb-[12px]'>
                        <Material.TextField fullWidth onChange={(e) => {
                        if (e.target.value && validateAmount(e.target.value)) {
                            setTransferTx(state => { return { ...state, amount: e.target.value } });
                        }
                    }} label='amount' />
                    <Material.Typography sx={{marginY: '12px'}}>Destination Network</Material.Typography>
                    <Material.Select
                    fullWidth
                    labelId='Destination'
                    value={transferTx.network.name}
                    label='Destination'
                    onChange={handleNetworkSelection}>
                        <Material.MenuItem value='Goerli'>Goerli</Material.MenuItem>
                        <Material.MenuItem value='BNB Chain Testnet'>BNB Smart Chain Testnet</Material.MenuItem>
                        <Material.MenuItem value='Polygon Mumbai'>Polygon Mumbai</Material.MenuItem>
                    </Material.Select>
                    </div>
                    <div className='pb-[12px]'>
                    </div>

                <Material.Button
                    sx={{ width: '100%' }}
                    onClick={() => {
                        if (!transferTx) {
                            console.error("Missing transaction details.");
                            return;
                        }
                        bridge.prepareSendTransaction(transferTx.network, transferTx.amount)
                    }}
                    variant='contained'
                    type='button'
                >
                    Transfer
                </Material.Button>
                
                </Material.CardContent>
        </Material.Card>                
    )
}

function validateAddress(test: string): boolean {
    if (test === undefined) return true;
    return /^$|^0x[a-fA-F0-9]{40}$/.test(test);
}

function validateAmount(test: string): boolean {
    if (test === undefined || test === "") return true;
    let num = parseInt(test);
    if (num !== num) return false;
    return /[0-9]*/.test(test) && num> 0;
}