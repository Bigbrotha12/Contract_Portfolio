import React from 'react';
import Material from '../../../assets/Material';
import { useForm } from 'react-hook-form';
import Merkle from '../../../../contracts/1_Airdrop/scripts/merkleRootCalculator';

export default function Airdrop(props: {recipientCount: number})
{
    const { register, handleSubmit } = useForm();
    function handleInputSubmit(e: React.FormEventHandler<HTMLFormElement> | any)
    {
        e.preventDefault();
        console.log(e);
        
    }
    function prepareRoot(data)
    {
        let sample = [
            { to: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", amount: "500" },
            { to: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", amount: "200" },
            { to: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db", amount: "300" },
            { to: "0x0000000000000000000000000000000000000000", amount: "0" }
        ];
        let leaves = Merkle.createLeaves(sample);
        console.log(leaves);
        console.log(Merkle.calculateMerkleRoot(leaves));
    }

    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Airdrop Contract" />
            <Material.CardContent>
                <>
                {/* Airdrop Recipients Input + Deployment */}
                <form className='pb-[12px]' onSubmit={handleSubmit((data) => console.log(data))}>
                <Material.Typography sx={{paddingTop: '12px'}}>Recipients</Material.Typography>
                <Material.Divider />
                {
                    [...Array(props.recipientCount)].map((n, i) => {
                        return (
                            <div key={i} className='flex justify-between w-full py-[12px]'>
                                <div className='w-[48%]'>
                                    <Material.TextField inputProps={{ ...register(`address${i}`) }} fullWidth label='address' />
                                </div>
                                <div className='w-[48%]'>
                                    <Material.TextField inputProps={{ ...register(`amount${i}`) }} fullWidth label='amount'  />
                                </div>
                            </div>
                        )
                    })
                }
                <Material.Button variant='contained' type='submit'>Submit</Material.Button>
                </form>
                    
                {/* Airdrop Claim View */}
                <Material.Typography sx={{paddingTop: '12px'}}>View Claim</Material.Typography>
                <Material.Divider />
                <form className='pb-[12px]' onSubmit={handleSubmit((data) => console.log(data))}>
                    <div className='w-full py-[12px]'>
                        <div className='flex justify-between w-full'>
                                <Material.Typography sx={{width: '40%', marginY: 'auto'}}>Check Claim</Material.Typography>
                                <Material.TextField inputProps={{ ...register(`addressCheck`) }} fullWidth label='Address' />
                        </div>
                        <div className='py-[12px] w-full'>
                                <Material.Button sx={{width: '100%'}} variant='contained' onClick={prepareRoot}>Check Address</Material.Button>
                        </div>
                    </div>
                </form>
                    
                {/* Airdrop Claim Transact */}
                <Material.Typography>Claim Airdrop</Material.Typography>
                <Material.Divider />
                <form className='pb-[12px]' onSubmit={handleSubmit((data) => console.log(data))}>
                    <div className='w-full py-[12px]'>
                        <div className='flex justify-between w-full'>
                                <Material.Typography sx={{ width: '40%', marginY: 'auto' }}>Claim</Material.Typography>
                                <Material.Button sx={{width: '100%'}} variant='contained' onClick={prepareRoot}>Claim</Material.Button>
                        </div>
                        
                    </div>
                </form>
                </>
                </Material.CardContent>
        </Material.Card>                
    )
    
}