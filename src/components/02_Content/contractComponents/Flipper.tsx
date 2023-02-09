import React from 'react';
import Material from '../../../assets/Material';
import IController from '../../../app/IController';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import { useFlipper, WinState } from '../../../app/ContractHooks';
import { Action, AppConnectionData } from '../../../app/Definitions';

export default function Flipper(props: {setConnection: React.Dispatch<Action> })
{
    const [newBet, setNewBet] = React.useState<string>("0");
    const controller: IController = React.useContext(ControllerContext);
    const connection: AppConnectionData = React.useContext(ConnectionContext);
    const [balance, winState, flipper, transactions] = useFlipper(connection.account, connection.network.name, controller);
    
    React.useEffect(() => {
        props.setConnection({ type: "ADD_TRANSACTION", payload: transactions });
    }, [transactions])

    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Oracle Flip Contract" />
            <Material.CardContent>
                <div className=''>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{paddingTop: '12px'}}>Coin Betting Game</Material.Typography>
                        <Material.Divider />
                    </div>
                    <Material.Typography sx={{ marginY: '12px' }}>Current Funds: {balance || "0"}</Material.Typography>
                    <Material.Typography sx={{ marginY: '12px' }}>Outcome: {winStateParse(winState)}</Material.Typography>
                    <Material.Typography sx={{width: '40%', marginY: '12px', fontWeight: 'bold'}}>Enter Betting Amount</Material.Typography>
                    <Material.TextField sx={{ marginY: '12px' }} value={newBet} type='number' onChange={(e) => {
                        if (e.target.value && validateAmount(e.target.value)) {
                            setNewBet(e.target.value);
                        }
                    }} fullWidth label='Bet' />    
                    <div className='flex justify-center'>
                        <Material.Button sx={{marginX: '12px'}} fullWidth variant='contained' onClick={() => flipper.placeBet(newBet)}>Place Bet</Material.Button>
                        <Material.Button sx={{ marginX: '12px' }} fullWidth variant='contained' onClick={() => flipper.flipCoin()}>Flip Coin</Material.Button>
                        <Material.Button sx={{marginX: '12px'}} fullWidth variant='contained' onClick={() => flipper.withdrawFunds(newBet)}>Withdraw</Material.Button>
                    </div>
                </div>
            </Material.CardContent>
        </Material.Card>                
    )
}

function validateAmount(test: string): boolean {
    if (test === undefined || test === "") return true;
    let num = parseInt(test);
    if (num !== num) return false;
    return /[0-9]*/.test(test) && num> 0;
}

function winStateParse(status: WinState): string {
    switch (status) {
        case WinState.NONE:
            return "Not started.";
        case WinState.WON:
            return "You've won!";
        case WinState.LOST:
            return "Sorry, you've lost...";
    }
}