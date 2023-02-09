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
export default function Bridge(props: { setConnection: React.Dispatch<Action> })
{
    const [transferTx, setTransferTx] = React.useState<BridgeTx>({ amount: '0', network: Networks[0] });
    const controller: IController = React.useContext(ControllerContext);
    const connection: AppConnectionData = React.useContext(ConnectionContext);
    const [bridge, transactions] = useBridge(connection.account, connection.network.name, controller);
    
    React.useEffect(() => {
        props.setConnection({ type: "ADD_TRANSACTION", payload: transactions } );
    }, [transactions])

    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Bridge Contract" />
            <Material.CardContent>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{ paddingTop: '12px' }}>Token Transfer Bridge</Material.Typography>
                        <Material.Divider />
                    </div>
                    
                    <div className='pb-[12px]'>
                    {/* <Material.TextField fullWidth onChange={(e) => {
                        if (e.target.value && validateAddress(e.target.value)) {
                            setTransferTx(state => { return { ...state, recipient: e.target.value } });
                        }
                    }} label='address' /> */}
                    </div>
                    <div className='pb-[12px]'>
                        <Material.TextField fullWidth onChange={(e) => {
                        if (e.target.value && validateAmount(e.target.value)) {
                            setTransferTx(state => { return { ...state, amount: e.target.value } });
                        }
                    }} label='amount' />
                    </div>
                    <div className='pb-[12px]'>
                    </div>

                <Material.Button
                    sx={{ width: '100%' }}
                    onClick={() => bridge.prepareSendTransaction(transferTx.network, transferTx.amount)}
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