import React from 'react';
import Material from '../../../assets/Material';
import { useForm } from 'react-hook-form';
import Merkle from '../../../../contracts/scripts/merkleRootCalculator';

type AirdropData = Array<{to: string, amount: string}>;
const tokenLimit = 1_000;
export default function Airdrop(props: {recipientCount: number})
{
    const { register, handleSubmit, setError, formState: { errors } } = useForm();
    function handleInputSubmit(data) {
        let airdrop = parseAirdropData(data);
        console.log(airdrop);
        let root = prepareRoot(airdrop);
        console.log(root);
    }
    
    
    function prepareRoot(data: AirdropData) {
        let sample: AirdropData = [
            { to: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", amount: "500" },
            { to: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", amount: "200" },
            { to: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db", amount: "300" },
            { to: "0x0000000000000000000000000000000000000000", amount: "0" }
        ];
        let leaves = Merkle.createLeaves(sample);
        let root = Merkle.calculateMerkleRoot(leaves);
        console.log(leaves);
        console.log(root);
        return root;
    }

    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Airdrop Contract" />
            <Material.CardContent>
                <>
                {/* Airdrop Recipients Input + Deployment */}
                <form className='pb-[12px]' onSubmit={handleSubmit(handleInputSubmit)}>
                <Material.Typography sx={{paddingTop: '12px'}}>Recipients</Material.Typography>
                <Material.Divider />
                {
                    [...Array(props.recipientCount)].map((n, i) => {
                        return (
                            <div key={i} className='flex justify-between w-full py-[12px]'>
                                <div className='w-[48%]'>
                                    <Material.TextField
                                        error={!validateAddress((errors[`address${i}`] as any)?.ref?.value)}
                                        inputProps={{ ...register(`address${i}`), pattern: '^0x[a-fA-F0-9]{40}$' }}
                                        fullWidth
                                        onChange={() => setError(`address${i}`, { type: 'pattern' })}
                                        label={!validateAddress((errors[`address${i}`] as any)?.ref?.value) ? 'invalid address' : 'address'}
                                        placeholder="Enter a valid address"
                                    />
                                </div>
                                <div className='w-[48%]'>
                                    <Material.TextField
                                        error={!validateAmount((errors[`amount${i}`] as any)?.ref?.value)}
                                        inputProps={{ ...register(`amount${i}`), inputMode: 'numeric', pattern: '[0-9]*', max: {tokenLimit} }}
                                        fullWidth
                                        onChange={() => setError(`amount${i}`, { type: 'pattern' })}
                                        label={!validateAmount((errors[`amount${i}`] as any)?.ref?.value) ? 'invalid amount' : 'amount'}
                                        placeholder="Enter value [0 - 1,000]"
                                    />
                                </div>
                            </div>
                        )
                    })
                }
                <Material.Button variant='contained' fullWidth type='submit'>Submit</Material.Button>
                </form>
                    
                <Material.Typography sx={{paddingTop: '12px'}}>View Claim</Material.Typography>
                <Material.Divider />
                
                    <div className='w-full py-[12px]'>
                        <div className='flex justify-between w-full'>
                                <Material.Typography sx={{width: '40%', marginY: 'auto', fontWeight: 'bold'}}>Check Claim</Material.Typography>
                                <Material.TextField fullWidth label='Address' required inputProps={{pattern: '^0x[a-fA-F0-9]{40}$' }} />
                        </div>
                        <div className='py-[12px] w-full'>
                                <Material.Button fullWidth variant='contained' type='submit'>Check Address</Material.Button>
                        </div>
                    </div>
                
                    
                <Material.Typography>Claim Airdrop</Material.Typography>
                <Material.Divider />
            
                    <div className='w-full py-[12px]'>
                        <div className='flex justify-between w-full'>
                                <Material.Typography sx={{ width: '40%', marginY: 'auto', fontWeight: 'bold' }}>Claim</Material.Typography>
                                <Material.Button fullWidth variant='contained'>Claim</Material.Button>
                        </div>
                        
                    </div>
              
                </>
                </Material.CardContent>
        </Material.Card>                
    )
    
}

function parseAirdropData(data: Object): AirdropData {
    const addressZero: string = "0x0000000000000000000000000000000000000000";
    let keys: Array<string> = Object.keys(data);
    let result: AirdropData = [];
    for (let i = 0; i < keys.length; i += 2)
    {
        let address: string = data[keys[i]];
        let amount: string = data[keys[i+1]];
        if (!address) { address = addressZero; }
        if (!parseInt(amount)) { amount = "0"; }
        result.push({ to: address, amount: amount });
    }
    return result;
}

function validateAddress(test: string): boolean {
    if (test === undefined) return true;
    return /^$|^0x[a-fA-F0-9]{40}$/.test(test);
}

function validateAmount(test: string): boolean {
    if (test === undefined || test === "") return true;
    let num = parseInt(test);
    if (num !== num) return false;
    return /[0-9]*/.test(test) && num <= tokenLimit;
}