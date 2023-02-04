import React from 'react';
import { AppConnectionData } from '../../../app/Definitions';
import IController from '../../../app/IController';
import Material from '../../../assets/Material';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import { useTestToken } from '../../02_Content/contractComponents/contractHooks';

export default function TestBalance()
{
    const controller = React.useContext<IController>(ControllerContext); 
    const connection = React.useContext<AppConnectionData>(ConnectionContext);
    const [amount, token] = useTestToken(connection.account, connection.network.name, controller);

    return (
        <div className='my-auto px-[32px]'>
            <Material.Chip label={`TestTokens: ${amount}`} variant='outlined' />
            <Material.Button onClick={() => token.faucet()}>
                <Material.Chip label={`Get DEMO Tokens`} variant='outlined' />
            </Material.Button>
        </div>
    )
}