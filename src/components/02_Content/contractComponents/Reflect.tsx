import React from 'react';
import Material from '../../../assets/Material';
import { useForm } from 'react-hook-form';
import { Networks } from '../../00_Common/Networks';
import { AppConnectionData, Network } from '../../00_Common/Definitions';

export default function Reflect()
{
    const { register, handleSubmit } = useForm();
    const [targetNetwork, setTargetNetwork] = React.useState<Network>(Networks[0]);
    function handleInputSubmit(data)
    {
        console.log(data);
    }
    
    
    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Reflect Token Contract" />
            <Material.CardContent>
                <>
                
                <Material.Typography sx={{paddingTop: '12px'}}>Reflect Token Offering</Material.Typography>
                <Material.Divider />

                <Material.Typography sx={{width: '40%', marginY: 'auto'}}>Offering Price: </Material.Typography>
                <Material.TextField inputProps={{ ...register(`address`) }} fullWidth label='Purchase Amount' />
                <Material.Button variant='contained' type='submit'>Purchase</Material.Button>
                <Material.Divider />
                
                <Material.Typography sx={{ paddingTop: '12px' }}>Current Reflect Token Balance</Material.Typography>
                <Material.Typography sx={{paddingTop: '12px'}}>Transfer Tokens</Material.Typography>
                <Material.TextField inputProps={{ ...register(`address`) }} fullWidth label='Address' />
                <Material.TextField inputProps={{ ...register(`address`) }} fullWidth label='Amount' />
                <Material.Button variant='contained' type='submit'>Transfer</Material.Button>
                </>
                </Material.CardContent>
        </Material.Card>                
    )
    
}