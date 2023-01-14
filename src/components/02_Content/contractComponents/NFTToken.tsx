import React from 'react';
import Material from '../../../assets/Material';
import { useForm } from 'react-hook-form';
import { Networks } from '../../00_Common/Networks';
import { AppConnectionData, Network } from '../../00_Common/Definitions';

export default function NFTToken()
{
    const { register, handleSubmit } = useForm();

    function MintToken()
    {

    }
    
    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="NFT Contract" />
            <Material.CardContent>
                <div>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{paddingTop: '12px'}}>NFT Token</Material.Typography>
                        <Material.Divider />
                    </div>
                    <div className='flex justify-center'>
                        <Material.Button variant='contained' type='submit'>Mint Token</Material.Button>
                    </div>
                    <Material.Typography sx={{ marginY: '12px' }}>Current NFT Token Balance</Material.Typography>
                    <Material.Typography sx={{ marginY: '12px'}}>Transfer NFT</Material.Typography>
                    <Material.TextField sx={{ marginY: '12px' }} inputProps={{ ...register(`address`) }} fullWidth label='Address' />
                    <Material.TextField sx={{ marginY: '12px' }} inputProps={{ ...register(`address`) }} fullWidth label='Token ID' />
                    <div className='flex justify-center'>
                        <Material.Button variant='contained' type='submit'>Transfer</Material.Button>
                    </div> 
                </div>
                </Material.CardContent>
        </Material.Card>                
    )
    
}