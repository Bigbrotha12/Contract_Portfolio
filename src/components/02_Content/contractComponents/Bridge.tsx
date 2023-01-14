import React from 'react';
import Material from '../../../assets/Material';
import { useForm } from 'react-hook-form';
import NetworkSelector from '../../01_Header/components/NetworkSelector';
import { Networks } from '../../00_Common/Networks';
import { AppConnectionData, Network } from '../../00_Common/Definitions';

export default function Bridge()
{
    const { register, handleSubmit } = useForm();
    const [targetNetwork, setTargetNetwork] = React.useState<Network>(Networks[0]);
    function handleInputSubmit(data)
    {
        console.log(data);
    }
    function NetworkCallback(network: Network)
    {
        setTargetNetwork(network);
    }
    
    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Bridge Contract" />
            <Material.CardContent>
                
                <form onSubmit={handleSubmit(handleInputSubmit)}>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{ paddingTop: '12px' }}>Token Transfer Bridge</Material.Typography>
                        <Material.Divider />
                    </div>
                    
                    <div className='pb-[12px]'>
                        <Material.TextField inputProps={{ ...register(`address`) }} fullWidth label='Address' />
                    </div>
                    <div className='pb-[12px]'>
                        <Material.TextField inputProps={{ ...register(`amount`) }} fullWidth label='Amount' />
                    </div>
                    <div className='pb-[12px]'>
                        <NetworkSelector title='Network' selected={targetNetwork} options={Networks} callback={NetworkCallback} />
                    </div>

                    <Material.Button sx={{width: '100%'}} variant='contained' type='submit'>Transfer</Material.Button>
                </form>
                
                </Material.CardContent>
        </Material.Card>                
    )
    
}