import React from 'react';
import Material from '../../../assets/Material';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import IController from '../../../app/IController';
import { Contracts } from '../../../app/Networks';
import { Action, AppConnectionData } from '../../../app/Definitions';
import { useReflect } from '../../../app/ContractHooks';

type ReflectTx = {
    purchaseAmount: string,
    recipient: string,
    transferAmount: string
}
export default function Reflect(props: {setConnection: React.Dispatch<Action>, setInfoBanner: React.Dispatch<React.SetStateAction<{message: string, warning: string}>> })
{
    const [transactionDetails, setTransactionDetails] = React.useState<ReflectTx>({purchaseAmount: "0", recipient: "", transferAmount: "0"});
    const controller: IController = React.useContext(ControllerContext);
    const connection: AppConnectionData = React.useContext(ConnectionContext);    
    const [userBalance, price, reflect, transactions, error] = useReflect(connection.account, connection.network.name, controller);
    
    React.useEffect(() => {
        props.setConnection({ type: "ADD_TRANSACTION", payload: transactions });
    }, [transactions]);

    React.useEffect(() => {
        props.setInfoBanner(state => { return { ...state, warning: error } });
    }, [error]);

    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Reflect Token Contract" />
            <Material.CardContent>
                <div>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{paddingTop: '12px'}}>Reflect Token Offering</Material.Typography>
                        <Material.Divider />
                    </div>

                <Material.Typography sx={{ width: '40%', marginY: '12px' }}>Offering Price: {price}</Material.Typography>
                    <Material.TextField
                        sx={{ marginY: '12px' }}
                        onChange={(e) => {
                            if (validateNumber(e.target.value))
                            {
                                setTransactionDetails((state) => { return { ...state, purchaseAmount: e.target.value } });
                            }
                        }}
                        fullWidth
                        label='purchase Amount' />
                <div className='flex justify-center'>
                        <Material.Button sx={{ marginBottom: '24px' }} fullWidth variant='contained' type='button' onClick={() => reflect.purchase(transactionDetails.purchaseAmount)}>Purchase</Material.Button>
                </div>
                <Material.Divider />
                
                    <Material.Typography sx={{ marginY: '12px' }}>Current Reflect Token Balance: {userBalance}</Material.Typography>
                <Material.Typography sx={{fontWeight: 'bold'}}>Transfer Tokens</Material.Typography>
                    <Material.TextField
                        sx={{ marginTop: '12px' }}
                        onChange={(e) => {
                            if (validateAddress(e.target.value))
                            {
                                setTransactionDetails((state) => { return { ...state, recipient: e.target.value } });
                            }
                        }}
                        fullWidth
                        label='address' />
                    <Material.TextField
                        sx={{ marginTop: '12px' }}
                        onChange={(e) => {
                            if (validateNumber(e.target.value))
                            {
                                setTransactionDetails((state) => { return { ...state, transferAmount: e.target.value } });
                            }
                        }}
                        fullWidth
                        label='amount' />
                <div className='flex justify-center'>
                    <Material.Button sx={{ marginY: '12px'}} fullWidth variant='contained' type='button' onClick={() => reflect.transfer(transactionDetails.recipient, transactionDetails.transferAmount)}>Transfer</Material.Button>
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