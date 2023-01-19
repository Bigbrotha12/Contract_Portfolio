import React from 'react';
import Material from '../../../assets/Material';
import IController from '../../../app/IController';
import { ControllerContext } from '../../../state/AppContext';

export default function Flipper()
{
    const [bet, setBet] = React.useState<number>(0);
    const controller: IController = React.useContext(ControllerContext);

    function triggerCoinFlip() {
        controller.FlipperFlipCoin();
    }
    function placeBet() {
        if (bet) {
            controller.FlipperAddFunds(bet);
        }
    }
    function withdrawFunds() {
        controller.FlipperWithdrawFunds();
    }
    
    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Oracle Flip Contract" />
            <Material.CardContent>
                <div className=''>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{paddingTop: '12px'}}>Coin Betting Game</Material.Typography>
                        <Material.Divider />
                    </div>
                    <Material.Typography sx={{marginY: '12px'}}>Current Funds: </Material.Typography>
                    <Material.Typography sx={{width: '40%', marginY: '12px', fontWeight: 'bold'}}>Enter Betting Amount</Material.Typography>
                    <Material.TextField sx={{ marginY: '12px' }} value={bet} type='number' onChange={(e) => {
                        if (e.target.value && validateAmount(e.target.value)) {
                            setBet(parseInt(e.target.value));
                        }
                    }} fullWidth label='Bet' />    
                    <div className='flex justify-center'>
                        <Material.Button sx={{marginX: '12px'}} variant='contained' onClick={placeBet}>Place Bet</Material.Button>
                        <Material.Button sx={{ marginX: '12px' }} variant='contained' onClick={triggerCoinFlip}>Flip Coin</Material.Button>
                        <Material.Button sx={{marginX: '12px'}} variant='contained' onClick={withdrawFunds}>Withdraw</Material.Button>
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