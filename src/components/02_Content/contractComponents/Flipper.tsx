import React from 'react';
import Material from '../../../assets/Material';
import IController from '../../../app/IController';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import { useFlipper, WinState } from '../../../app/ContractHooks';
import { Action, AppConnectionData } from '../../../app/Definitions';

export default function Flipper(props: {setConnection: React.Dispatch<Action>, setInfoBanner: React.Dispatch<React.SetStateAction<{message: string, warning: string}>> })
{
    const [newBet, setNewBet] = React.useState<string>("0");
    const controller: IController = React.useContext(ControllerContext);
    const connection: AppConnectionData = React.useContext(ConnectionContext);
    const [balance, winState, flipper, transactions, error] = useFlipper(connection.account, connection.network.name, controller, connection.walletMnemonics);
    
    // Event Tracker Update
    React.useEffect(() => {
        props.setConnection({ type: "ADD_TRANSACTION", payload: transactions });
    }, [transactions]);

    // Info Banner Update
    React.useEffect(() => {
        let infoMessage = "The Coin Flipper contract is a simple gambling game. You add funds to the contract as a bet, and click Flip Coin. On heads you double your bet, but on tails you lose your bet. \
        The contract uses DEMO tokens which you can obtain for free. The contract uses Chainlink Oracle network as source of randomness.";
        props.setInfoBanner(state => { return { ...state, message: infoMessage } });
    }, []);
    React.useEffect(() => {
        props.setInfoBanner(state => { return { ...state, warning: error } });
    }, [error]);

    return (
        <Material.Card sx={{margin: "12px"}}>
            <div className='flex justify-between'>
            <Material.CardHeader title="Coin Flip Contract" />
            <Material.Link
                    sx={{ padding: '12px' }}
                    onClick={() => window.open('https://github.com/Bigbrotha12/Contract_Portfolio/blob/master/contracts/contracts/G_Oracle_Contract/CoinFlipper.sol')?.focus()}
                >View Source Code</Material.Link>
            </div>
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
                        if (validateAmount(e.target.value)) {
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
    return /[0-9]*/.test(test) && num >= 0;
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