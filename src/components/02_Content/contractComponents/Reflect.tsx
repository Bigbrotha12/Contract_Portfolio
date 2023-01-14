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
                <div>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{paddingTop: '12px'}}>Reflect Token Offering</Material.Typography>
                        <Material.Divider />
                    </div>

                <Material.Typography sx={{width: '40%', marginY: '12px'}}>Offering Price: </Material.Typography>
                <Material.TextField sx={{marginY: '12px'}} inputProps={{ ...register(`address`) }} fullWidth label='Purchase Amount' />
                <div className='flex justify-center'>
                    <Material.Button sx={{ marginBottom: '24px' }} variant='contained' type='submit'>Purchase</Material.Button>
                </div>
                <Material.Divider />
                
                <Material.Typography sx={{ marginY: '12px' }}>Current Reflect Token Balance: </Material.Typography>
                <Material.Typography sx={{fontWeight: 'bold'}}>Transfer Tokens</Material.Typography>
                <Material.TextField sx={{ marginTop: '12px'}} inputProps={{ ...register(`address`) }} fullWidth label='Address' />
                <Material.TextField sx={{ marginTop: '12px' }} inputProps={{ ...register(`address`) }} fullWidth label='Amount' />
                <div className='flex justify-center'>
                    <Material.Button sx={{ marginY: '12px'}} variant='contained' type='submit'>Transfer</Material.Button>
                </div>
                
                </div>
                </Material.CardContent>
        </Material.Card>                
    )
    
}