import React from 'react';
import Material from '../../../assets/Material';
import IController from '../../../app/IController';
import { ControllerContext } from '../../../state/AppContext';
import { Contracts } from '../../../app/Networks';

export default function Flipper()
{
    const controller: IController = React.useContext(ControllerContext);
    const [newBet, setNewBet]: [number, React.Dispatch<React.SetStateAction<number>>] = React.useState(0);
    const useFlipper = (): [number, string] => {
        const [pot, setPot] = React.useState<number>(0);
        const [winState, setWinState] = React.useState<string>("");
        async function handleFlipperEvent(event) {
            console.log(event);
        }

        React.useEffect(() => {
            if (controller.ConnectionStatus()) {
                setPot(controller.FlipperCheckFunds());
            }
            controller.Subscribe(Contracts.get("Flipper")!, "betPlaced", handleFlipperEvent);
            controller.Subscribe(Contracts.get("Flipper")!, "betPaidOut", handleFlipperEvent);
            controller.Subscribe(Contracts.get("Flipper")!, "logNewQueryd", handleFlipperEvent);
            controller.Subscribe(Contracts.get("Flipper")!, "randomNumber", handleFlipperEvent);

            return (() => {
                controller.Unsubscribe(Contracts.get("Flipper")!, "betPlaced", handleFlipperEvent);
                controller.Unsubscribe(Contracts.get("Flipper")!, "betPaidOut", handleFlipperEvent);
                controller.Unsubscribe(Contracts.get("Flipper")!, "logNewQueryd", handleFlipperEvent);
                controller.Unsubscribe(Contracts.get("Flipper")!, "randomNumber", handleFlipperEvent);
            })
        }, []);
        return [pot, winState];
    }
    const [pot, winState]: [number, string] = useFlipper();
    function triggerCoinFlip() {
        controller.FlipperFlipCoin();
    }
    function placeBet() {
        if (newBet) {
            controller.FlipperAddFunds(newBet);
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
                    <Material.Typography sx={{ marginY: '12px' }}>Current Funds: {pot}</Material.Typography>
                    <Material.Typography sx={{ marginY: '12px' }}>Outcome: {winState}</Material.Typography>
                    <Material.Typography sx={{width: '40%', marginY: '12px', fontWeight: 'bold'}}>Enter Betting Amount</Material.Typography>
                    <Material.TextField sx={{ marginY: '12px' }} value={newBet} type='number' onChange={(e) => {
                        if (e.target.value && validateAmount(e.target.value)) {
                            setNewBet(parseInt(e.target.value));
                        }
                    }} fullWidth label='Bet' />    
                    <div className='flex justify-center'>
                        <Material.Button sx={{marginX: '12px'}} fullWidth variant='contained' onClick={placeBet}>Place Bet</Material.Button>
                        <Material.Button sx={{ marginX: '12px' }} fullWidth variant='contained' onClick={triggerCoinFlip}>Flip Coin</Material.Button>
                        <Material.Button sx={{marginX: '12px'}} fullWidth variant='contained' onClick={withdrawFunds}>Withdraw</Material.Button>
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