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
                <>
                
                <Material.Typography sx={{paddingTop: '12px'}}>NFT Token</Material.Typography>
                <Material.Divider />

       
                <Material.Button variant='contained' type='submit'>Mint Token</Material.Button>

                <Material.Typography sx={{ paddingTop: '12px' }}>Current NFT Token Balance</Material.Typography>
                <Material.Typography sx={{paddingTop: '12px'}}>Transfer NFT</Material.Typography>
                <Material.TextField inputProps={{ ...register(`address`) }} fullWidth label='Address' />
                <Material.TextField inputProps={{ ...register(`address`) }} fullWidth label='Token ID' />
                <Material.Button variant='contained' type='submit'>Transfer</Material.Button>
                </>
                </Material.CardContent>
        </Material.Card>                
    )
    
}