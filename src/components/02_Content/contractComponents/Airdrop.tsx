import React from 'react';
import Material from '../../../assets/Material';
import { useForm } from 'react-hook-form';
import IController from '../../../app/IController';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import { AppConnectionData } from '../../00_Common/Definitions';

type AirdropData = Array<{to: string, amount: string}>;
const tokenLimit = 1_000;
export default function Airdrop(props: {recipientCount: number})
{
    const [airdropList, setAirdropList] = React.useState<AirdropData>();
    const [checkAddress, setCheckAddress] = React.useState<string>("");
    const { register, handleSubmit, setError, formState: { errors } } = useForm();
    const controller: IController = React.useContext(ControllerContext);
    const connection: AppConnectionData = React.useContext(ConnectionContext);

    function handleAirdropData(data) {
        let airdrop = parseAirdropData(data);
        setAirdropList(airdrop);
        controller.AirdropNewRecipients(airdrop)
    }
    function handleAirdropCheck() {
        if (!/^0x[a-fA-F0-9]{40}$/.test(checkAddress)) {
            console.error("Invalid address.");
            return;
        }
        controller.AirdropCheckClaim(checkAddress);
    }
    function handleAirdropClaim() {
        if (!airdropList) {
            console.error("Airdrop list must be defined.");
            return;
        }
        let address: string = connection.account;
        let amount: string = airdropList.find((entry) => { return entry.to === address })?.amount || "0";
        controller.AirdropClaim(address, amount);
    }

    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Airdrop Contract" />
            <Material.CardContent>
                <>
                {/* Airdrop Recipients Input + Deployment */}
                <form className='pb-[12px]' onSubmit={handleSubmit(handleAirdropData)}>
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
                                        inputProps={{ ...register(`amount${i}`), inputMode: 'numeric', pattern: '[0-9]*' }}
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
                                {/* <Material.Typography sx={{width: '40%', marginY: 'auto', fontWeight: 'bold'}}>Check Claim</Material.Typography> */}
                            <Material.TextField
                                fullWidth
                                label='address'
                                required
                                inputProps={{ pattern: '^0x[a-fA-F0-9]{40}$', id: 'checkAddress' }}
                                onChange={(event) => setCheckAddress(event.target.value)}
                            />
                        </div>
                        <div className='py-[12px] w-full'>
                            <Material.Button fullWidth variant='contained' type='button' onClick={handleAirdropCheck}>Check Address</Material.Button>
                        </div>
                    </div>

                <Material.Typography>Claim Airdrop</Material.Typography>
                <Material.Divider />
            
                    <div className='w-full py-[12px]'>
                        <div className='flex justify-between w-full'>
                                {/* <Material.Typography sx={{ width: '40%', marginY: 'auto', fontWeight: 'bold' }}>Claim</Material.Typography> */}
                            <Material.Button fullWidth variant='contained' onClick={handleAirdropClaim}>Claim</Material.Button>
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
        let address: string = validateAddress(data[keys[i]]) ? data[keys[i]] : addressZero;
        let amount: string = validateAmount(data[keys[i+1]]) ? data[keys[i+1]] : "0";
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
    return /[0-9]*/.test(test) && num> 0 && num <= tokenLimit;
}