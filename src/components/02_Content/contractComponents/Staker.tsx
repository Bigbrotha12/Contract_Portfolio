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
                <>
               
                <Material.Typography sx={{paddingTop: '12px'}}>Staking Contract</Material.Typography>
                <Material.Divider />

                <Material.Typography sx={{ paddingTop: '12px' }}>Current Stake: 10 DEMO</Material.Typography>
                <Material.Typography sx={{paddingTop: '12px'}}>Current Reward: 5 DEMO</Material.Typography>
                <Material.TextField fullWidth label='Stake Amount' />
                <Material.Button variant='contained'>Stake Tokens</Material.Button>
                <Material.Button variant='contained'>Claim Rewards</Material.Button>
                <Material.Button variant='contained'>Withdraw Stake</Material.Button>
            
                </>
                </Material.CardContent>
        </Material.Card>                
    )
    
}