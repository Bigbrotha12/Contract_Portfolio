import React from 'react';
import Material from '../../../assets/Material';
import { useForm } from 'react-hook-form';
import { Networks } from '../../00_Common/Networks';
import { AppConnectionData, Network } from '../../00_Common/Definitions';

export default function Flipper()
{
    const { register, handleSubmit } = useForm();
    const [bet, setBet] = React.useState<number>(0);
    const [targetNetwork, setTargetNetwork] = React.useState<Network>(Networks[0]);
    function handleInputSubmit(data)
    {
        console.log(data);
    }
    function triggerCoinFlip()
    {

    }
    function placeBet()
    {

    }
    
    
    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Oracle Flip Contract" />
            <Material.CardContent>
                <>
               
                <Material.Typography sx={{paddingTop: '12px'}}>Coin Betting Game</Material.Typography>
                <Material.Divider />

                <Material.Typography>Current Bet: ${bet}</Material.Typography>
                        
                <Material.Typography sx={{width: '40%', marginY: 'auto'}}>Enter Betting Amount</Material.Typography>
                <Material.TextField inputProps={{ ...register(`amount`) }} value={bet} onChange={handleInputSubmit} fullWidth label='Bet' />
                <Material.Button variant='contained' onClick={placeBet}>Place Bet</Material.Button>
                <Material.Button variant='contained' onClick={triggerCoinFlip}>Flip Coin</Material.Button>
               
                </>
                </Material.CardContent>
        </Material.Card>                
    )
    
}