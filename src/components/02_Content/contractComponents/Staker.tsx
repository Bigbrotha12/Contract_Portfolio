import React from 'react';
import Material from '../../../assets/Material';
import { AppConnectionData, Network } from '../../00_Common/Definitions';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import IController from '../../../app/IController';

export default function Staker()
{
    const [stakeAmount, setStakeAmount] = React.useState<number>(0);
    const controller = React.useContext<IController>(ControllerContext);
    const connection = React.useContext<AppConnectionData>(ConnectionContext);

    function stakeTokens() {
        if (stakeAmount) {
            controller.StakeAddFunds(stakeAmount);
        }
    }
    function claimReward() {
        controller.StakeClaimReward();
    }
    function withdrawStake() {
        controller.StakeWithdrawFunds();
    }
    
    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="Staking Contract" />
            <Material.CardContent>
                <div>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{paddingTop: '12px'}}>Staking Contract</Material.Typography>
                        <Material.Divider />
                    </div>
                    <Material.Typography sx={{ marginY: '12px' }}>Current Stake: 10 DEMO</Material.Typography>
                    <Material.Typography sx={{ marginY: '12px'}}>Current Reward: 5 DEMO</Material.Typography>
                    <Material.TextField
                        sx={{ marginY: '12px' }}
                        fullWidth
                        onChange={(e) => {
                            if (validateNumber(e.target.value))
                            {
                                setStakeAmount(parseInt(e.target.value));
                            }
                        }}
                        label='Stake Amount'
                    />
                    <div className='flex justify-center'>
                        <Material.Button sx={{ marginX: '12px' }} onClick={stakeTokens} fullWidth variant='contained'>Stake Tokens</Material.Button>
                        <Material.Button sx={{ marginX: '12px' }} onClick={claimReward} fullWidth variant='contained'>Claim Rewards</Material.Button>
                        <Material.Button sx={{ marginX: '12px' }} onClick={withdrawStake} fullWidth variant='contained'>Withdraw Stake</Material.Button>
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