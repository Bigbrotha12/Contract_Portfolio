import React from 'react';
import Material from '../../../assets/Material';
import { ControllerContext } from '../../../state/AppContext';
import IController from '../../../app/IController';
import { Contracts } from '../../../app/Networks';

type TransferTx = {
    recipient: string,
    amount: number
}

export default function Reflect()
{
    const [purchase, setPurchase] = React.useState<number>(0);
    const [userBalance, setUserBalance] = React.useState<number>(0);
    const [offeringPrice, setOfferingPrice] = React.useState<number>(0);
    const [transfer, setTransfer] = React.useState<TransferTx>({recipient: '', amount: 0});
    const controller = React.useContext<IController>(ControllerContext);
    
    function purchaseToken() {
        if (purchase) {
            controller.ReflectGetToken(purchase);
        }
    }
    function transferToken() {
        if (transfer.recipient && transfer.amount) {
            controller.ReflectTransfer(transfer.recipient, transfer.amount);
        }
    }
    function updateUserBalance(e) {
        console.log(e);
    }
    
    React.useEffect(() => {
        if (controller.ConnectionStatus()) {
            setUserBalance(controller.ReflectBalance());
            setOfferingPrice(controller.ReflectGetPrice());
        }
        controller.Subscribe(Contracts.get("Reflect")!, "Transfer", updateUserBalance);
        return (() => controller.Unsubscribe(Contracts.get("Reflect")!, "Transfer", updateUserBalance));
    });
    
    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Reflect Token Contract" />
            <Material.CardContent>
                <div>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{paddingTop: '12px'}}>Reflect Token Offering</Material.Typography>
                        <Material.Divider />
                    </div>

                <Material.Typography sx={{ width: '40%', marginY: '12px' }}>Offering Price: {offeringPrice}</Material.Typography>
                    <Material.TextField
                        sx={{ marginY: '12px' }}
                        onChange={(e) => {
                            if (validateNumber(e.target.value))
                            {
                                setPurchase(parseInt(e.target.value));
                            }
                        }}
                        fullWidth
                        label='purchase Amount' />
                <div className='flex justify-center'>
                        <Material.Button sx={{ marginBottom: '24px' }} fullWidth variant='contained' type='button' onClick={purchaseToken}>Purchase</Material.Button>
                </div>
                <Material.Divider />
                
                    <Material.Typography sx={{ marginY: '12px' }}>Current Reflect Token Balance: {userBalance}</Material.Typography>
                <Material.Typography sx={{fontWeight: 'bold'}}>Transfer Tokens</Material.Typography>
                    <Material.TextField
                        sx={{ marginTop: '12px' }}
                        onChange={(e) => {
                            if (validateAddress(e.target.value))
                            {
                                setTransfer((state) => { return { ...state, recipient: e.target.value } });
                            }
                        }}
                        fullWidth
                        label='address' />
                    <Material.TextField
                        sx={{ marginTop: '12px' }}
                        onChange={(e) => {
                            if (validateNumber(e.target.value))
                            {
                                setTransfer((state) => { return { ...state, amount: parseInt(e.target.value) } });
                            }
                        }}
                        fullWidth
                        label='amount' />
                <div className='flex justify-center'>
                    <Material.Button sx={{ marginY: '12px'}} fullWidth variant='contained' type='button' onClick={transferToken}>Transfer</Material.Button>
                </div>
                
                </div>
                </Material.CardContent>
        </Material.Card>                
    )
}

function validateAddress(test: string): boolean {
    if (test === undefined) return true;
    return /^$|^0x[a-fA-F0-9]{40}$/.test(test);
}

function validateNumber(test: string): boolean {
    if (test === undefined || test === "") return true;
    let num = parseInt(test);
    if (num !== num) return false;
    return /[0-9]*/.test(test) && num > 0;
}