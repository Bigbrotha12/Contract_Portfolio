import React from 'react';
import Material from '../../../assets/Material';
import NetworkSelector from '../../01_Header/components/NetworkSelector';
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
    const [transferTx, setTransferTx] = React.useState<BridgeTx>({ amount: '0', network: Networks.get('Goerli')! });
    const controller: IController = React.useContext(ControllerContext);
    const connection: AppConnectionData = React.useContext(ConnectionContext);
    const [pendingTx, bridge, transactions, error] = useBridge(connection.account, connection.network.name, controller);
    
    function handleNetworkSelection(event) {
        let dest: Network = Networks.get(event.target.value)!;
        console.log(dest);
        console.log(event.target.value);
        setTransferTx(state => { return { ...state, network: dest } });
    }

    React.useEffect(() => {
        props.setConnection({ type: "ADD_TRANSACTION", payload: transactions });
    }, [transactions]);

    React.useEffect(() => {
        props.setInfoBanner(state => { return { ...state, warning: error }});
    }, [error]);

    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Bridge Contract" />
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
                    <Material.Select
                    labelId='Destination'
                    value={transferTx.network.name}
                    label={'Destination'}
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