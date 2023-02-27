import React, { Fragment } from 'react';
import Material from '../../../assets/Material';
import { useForm } from 'react-hook-form';
import IController from '../../../app/IController';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import { Action, AppConnectionData } from '../../../app/Definitions';
import { useAirdrop } from '../../../app/ContractHooks';

const tokenLimit = 1_000;
export default function Airdrop(props: { recipientCount: number, setConnection: React.Dispatch<Action>, setInfoBanner: React.Dispatch<React.SetStateAction<{message: string, warning: string}>> }) {
    const [checkAddress, setCheckAddress] = React.useState<string>('');
    const controller: IController = React.useContext(ControllerContext);
    const connection: AppConnectionData = React.useContext(ConnectionContext);
    const { register, handleSubmit, setError, formState: { errors } } = useForm();
    const [amount, claimed, airdrop, transactions, error] = useAirdrop(connection.account, connection.network.name, controller, connection.walletMnemonics);

    async function handleAirdropData(data) {
        if (connection.account) {
            await airdrop.createAirdrop(parseAirdropData(data));
        } else {
            props.setInfoBanner(state => { return { ...state, warning: "Please unlock your Web3 account." } });
        }
    }

    // Event Tracker Update
    React.useEffect(() => {
        props.setConnection({ type: "ADD_TRANSACTION", payload: transactions });
    }, [transactions]);

    // Info Banner Update
    React.useEffect(() => {
        let infoMessage = "This is an Airdrop contract. It allows you to designate a number of accounts as recipients of DEMO tokens. \
        This implementation makes use of pull approach, requiring recipients to claim their tokens. The airdrop state is stored as a Merkle root within the smart contract.";
        props.setInfoBanner(state => { return { ...state, message: infoMessage } });
    }, []);
    React.useEffect(() => {
        props.setInfoBanner(state => { return { ...state, warning: error } });
    }, [error]);

    return (
        <Material.Card sx={{ margin: "12px" }}>
            <div className='flex justify-between'>
            <Material.CardHeader title="Airdrop Contract" />
            <Material.Link
                    sx={{ padding: '12px' }}
                    onClick={() => window.open('https://github.com/Bigbrotha12/Contract_Portfolio/blob/master/contracts/contracts/B_Airdrop/AirdropDemo.sol')?.focus()}
                >View Source Code</Material.Link>
            </div>
            <Material.CardContent>
                <Fragment>
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
                                        onChange={() => setError(`address${i}`, { type: 'pattern', message: "Please enter a valid blockchain address." })}
                                        label={!validateAddress((errors[`address${i}`] as any)?.ref?.value) ? 'invalid address' : 'address'}
                                        placeholder="Enter a valid address"
                                    />
                                </div>
                                <div className='w-[48%]'>
                                    <Material.TextField
                                        error={!validateAmount((errors[`amount${i}`] as any)?.ref?.value)}
                                        inputProps={{ ...register(`amount${i}`), inputMode: 'numeric', pattern: '[0-9]*' }}
                                        fullWidth
                                        onChange={() => setError(`amount${i}`, { type: 'pattern', message: "Please enter a number within the range." })}
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
                            
                            <Material.TextField
                                fullWidth
                                label='address'
                                required
                                inputProps={{ pattern: '^0x[a-fA-F0-9]{40}$', id: 'checkAddress' }}
                                onChange={(event) => setCheckAddress(event.target.value)}
                            />
                        </div>
                        <div className='py-[12px] w-full'>
                            <Material.Button fullWidth variant='contained' type='button' onClick={() => {
                                airdrop.checkAddress(checkAddress)
                            }}>Check Address</Material.Button>
                        </div>
                    </div>

                <Material.Typography>Claim Airdrop</Material.Typography>
                <Material.Divider />
            
                    <div className='w-full py-[12px]'>
                        <div className=''>
                            <Material.Typography sx={{ marginY: '12px', }}>
                                Your address is entitled to: {amount} and has {claimed ? 'already claimed' : 'not yet claimed.'}
                            </Material.Typography>
                                {/* <Material.Typography sx={{ width: '40%', marginY: 'auto', fontWeight: 'bold' }}>Claim</Material.Typography> */}
                            <Material.Button fullWidth variant='contained' onClick={() => {
                                airdrop.claim(connection.account)
                            }
                            }>Claim</Material.Button>
                        </div>
                    </div>
              
                </Fragment>
                </Material.CardContent>
        </Material.Card>                
    )
    
}

function parseAirdropData(data: Object): Array<{ to: string, amount: string }> {
    const addressZero: string = "0x0000000000000000000000000000000000000000";
    let keys: Array<string> = Object.keys(data);
    let result: Array<{ to: string, amount: string }> = [];
    for (let i = 0; i < keys.length; i += 2)
    {
        let address: string = validateAddress(data[keys[i]]) ? data[keys[i]] : addressZero;
        let amount: string = validateAmount(data[keys[i + 1]]) ? data[keys[i + 1]] : "0";
        if (!address) { address = addressZero; }
        if (!amount) { amount = "0"; }
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