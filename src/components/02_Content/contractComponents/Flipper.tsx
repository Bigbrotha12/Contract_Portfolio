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
    function withdrawFunds()
    {

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
                    <Material.Typography sx={{marginY: '12px'}}>Current Funds: ${bet}</Material.Typography>
                    <Material.Typography sx={{width: '40%', marginY: '12px', fontWeight: 'bold'}}>Enter Betting Amount</Material.Typography>
                    <Material.TextField sx={{marginY: '12px'}} inputProps={{ ...register(`amount`) }} value={bet} type='number' onChange={handleInputSubmit} fullWidth label='Bet' />    
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