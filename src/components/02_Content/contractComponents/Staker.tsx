import React from 'react';
import Material from '../../../assets/Material';
import { useForm } from 'react-hook-form';
import { Networks } from '../../00_Common/Networks';
import { AppConnectionData, Network } from '../../00_Common/Definitions';

export default function Staker()
{
    const { register, handleSubmit } = useForm();
    
    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Staking Contract" />
            <Material.CardContent>
                <div>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{paddingTop: '12px'}}>Staking Contract</Material.Typography>
                        <Material.Divider />
                    </div>
                    <Material.Typography sx={{ marginY: '12px' }}>Current Stake: 10 DEMO</Material.Typography>
                    <Material.Typography sx={{ marginY: '12px'}}>Current Reward: 5 DEMO</Material.Typography>
                    <Material.TextField sx={{ marginY: '12px' }} fullWidth label='Stake Amount' />
                    <div className='flex justify-center'>
                        <Material.Button sx={{marginX: '12px'}} variant='contained'>Stake Tokens</Material.Button>
                        <Material.Button sx={{marginX: '12px'}} variant='contained'>Claim Rewards</Material.Button>
                        <Material.Button sx={{marginX: '12px'}} variant='contained'>Withdraw Stake</Material.Button>
                    </div> 
                </div>
                </Material.CardContent>
        </Material.Card>                
    )
    
}