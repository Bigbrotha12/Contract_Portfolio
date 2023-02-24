import React from 'react';
import Material from '../../../assets/Material';
import NetworkSelector from '../../01_Header/components/NetworkSelector';
import { Networks } from '../../../app/Networks';
import { Action, AppConnectionData, Network } from '../../../app/Definitions';
import IController from '../../../app/IController';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import { useBridge } from '../../../app/ContractHooks';

export default function EmptyContract(props: { setConnection: React.Dispatch<Action>, setInfoBanner: React.Dispatch<React.SetStateAction<{message: string, warning: string}>> }) {

    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="No Contract Selected." />
            <Material.CardContent>
                Please select a smart contract.    
                
            </Material.CardContent>
        </Material.Card>                
    )
}