import React from 'react';
import Material from '../../../assets/Material';
import { Networks } from '../../../app/Networks';
import { AppConnectionData, Network } from '../../00_Common/Definitions';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import IController from '../../../app/IController';

export default function Reflect()
{
    const [purchase, setPurchase] = React.useState<number>(0);
    const [recipient, setRecipient] = React.useState<string>("");
    const [transferAmount, setTransferAmount] = React.useState<number>(0);
    const controller = React.useContext<IController>(ControllerContext);
    const connection: AppConnectionData = React.useContext(ConnectionContext);
    
    function purchaseToken() {
        if (purchase) {
            controller.ReflectGetToken(purchase);
        }
    }
    function transferToken() {
        if (recipient && transferAmount) {
            controller.ReflectTransfer(recipient, transferAmount);
        }
    }
    
    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Reflect Token Contract" />
            <Material.CardContent>
                <div>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{paddingTop: '12px'}}>Reflect Token Offering</Material.Typography>
                        <Material.Divider />
                    </div>

                <Material.Typography sx={{width: '40%', marginY: '12px'}}>Offering Price: </Material.Typography>
                <Material.TextField sx={{marginY: '12px'}} fullWidth label='Purchase Amount' />
                <div className='flex justify-center'>
                        <Material.Button sx={{ marginBottom: '24px' }} fullWidth variant='contained' type='button' onClick={purchaseToken}>Purchase</Material.Button>
                </div>
                <Material.Divider />
                
                <Material.Typography sx={{ marginY: '12px' }}>Current Reflect Token Balance: </Material.Typography>
                <Material.Typography sx={{fontWeight: 'bold'}}>Transfer Tokens</Material.Typography>
                <Material.TextField sx={{ marginTop: '12px'}} fullWidth label='address' />
                <Material.TextField sx={{ marginTop: '12px' }} fullWidth label='amount' />
                <div className='flex justify-center'>
                    <Material.Button sx={{ marginY: '12px'}} fullWidth variant='contained' type='button' onClick={transferToken}>Transfer</Material.Button>
                </div>
                
                </div>
                </Material.CardContent>
        </Material.Card>                
    )
    
}