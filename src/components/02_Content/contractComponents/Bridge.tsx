import React from 'react';
import Material from '../../../assets/Material';
import NetworkSelector from '../../01_Header/components/NetworkSelector';
import { Networks } from '../../../app/Networks';
import { AppConnectionData, Network } from '../../00_Common/Definitions';
import IController from '../../../app/IController';
import { ControllerContext } from '../../../state/AppContext';

type BridgeTx = {
    recipient: string,
    amount: number,
    network: Network
}
export default function Bridge()
{
    const [transferTx, setTransferTx] = React.useState<BridgeTx>({recipient: "", amount: 0, network: Networks[0]});
    const controller: IController = React.useContext(ControllerContext);

    function networkSelection(data: Network) {
        setTransferTx(state => { return { ...state, network: data } });
    }
    function bridgeTransfer() {
        if (transferTx.recipient && transferTx.amount) {
            controller.BridgeTransferTo(transferTx.network, transferTx.amount);
        }
    }

    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Bridge Contract" />
            <Material.CardContent>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{ paddingTop: '12px' }}>Token Transfer Bridge</Material.Typography>
                        <Material.Divider />
                    </div>
                    
                    <div className='pb-[12px]'>
                    <Material.TextField fullWidth onChange={(e) => {
                        if (e.target.value && validateAddress(e.target.value)) {
                            setTransferTx(state => { return { ...state, recipient: e.target.value } });
                        }
                    }} label='address' />
                    </div>
                    <div className='pb-[12px]'>
                        <Material.TextField fullWidth onChange={(e) => {
                        if (e.target.value && validateAmount(e.target.value)) {
                            setTransferTx(state => { return { ...state, amount: parseInt(e.target.value) } });
                        }
                    }} label='amount' />
                    </div>
                    <div className='pb-[12px]'>
                    <NetworkSelector title='Network' selected={{ name: transferTx.network.name }} options={Networks} callback={networkSelection} />
                    </div>

                    <Material.Button sx={{width: '100%'}} onClick={bridgeTransfer} variant='contained' type='button'>Transfer</Material.Button>
                
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