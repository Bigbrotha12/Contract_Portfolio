import React from 'react';
import Material from '../../../assets/Material';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import IController from '../../../app/IController';
import { Action, AppConnectionData } from '../../../app/Definitions';
import { useStaker } from '../../../app/ContractHooks';

export default function Staker(props: {setConnection: React.Dispatch<Action>, setInfoBanner: React.Dispatch<React.SetStateAction<{message: string, warning: string}>> })
{
    const [newStake, setNewStake] = React.useState<string>("0");
    const controller = React.useContext<IController>(ControllerContext);
    const connection = React.useContext<AppConnectionData>(ConnectionContext);

    const [userBalance, rewardBalance, staker, transactions, error] = useStaker(connection.account, connection.network.name, controller);
    
    React.useEffect(() => {
        props.setConnection({ type: "ADD_TRANSACTION", payload: transactions });
    }, [transactions])

    React.useEffect(() => {
        props.setInfoBanner(state => { return { ...state, warning: error } });
    }, [error]);
    
    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Staking Contract" />
            <Material.CardContent>
                <div>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{paddingTop: '12px'}}>Staking Contract</Material.Typography>
                        <Material.Divider />
                    </div>
                    <Material.Typography sx={{ marginY: '12px' }}>Current Stake: {userBalance} DEMO</Material.Typography>
                    <Material.Typography sx={{ marginY: '12px'}}>Current Reward: {rewardBalance} DEMO</Material.Typography>
                    <Material.TextField
                        sx={{ marginY: '12px' }}
                        fullWidth
                        onChange={(e) => {
                            if (validateNumber(e.target.value))
                            {
                                setNewStake(e.target.value);
                            }
                        }}
                        label='Stake Amount'
                    />
                    <div className='flex justify-center'>
                        <Material.Button sx={{ marginX: '12px' }} onClick={() => staker.stakeTokens(newStake)} fullWidth variant='contained'>Stake Tokens</Material.Button>
                        <Material.Button sx={{ marginX: '12px' }} onClick={() => staker.claimReward()} fullWidth variant='contained'>Claim Rewards</Material.Button>
                        <Material.Button sx={{ marginX: '12px' }} onClick={() => staker.withdrawStake(newStake)} fullWidth variant='contained'>Withdraw Stake</Material.Button>
                    </div> 
                </div>
                </Material.CardContent>
        </Material.Card>                
    )
    
}

function validateNumber(test: string): boolean {
    if (test === undefined || test === "") return true;
    let num = parseInt(test);
    if (num !== num) return false;
    return /[0-9]*/.test(test) && num > 0;
}