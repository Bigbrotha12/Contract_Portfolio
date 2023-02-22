import React from 'react';
import { Action, AppConnectionData } from '../../app/Definitions';
import { ConnectionContext, ControllerContext } from '../../state/AppContext';
import IController from '../../app/IController';

import APIStatus from './components/APIStatus';
import Connector from './components/Connector';
import TestBalance from './components/TestBalance';
import Account from './components/Account';
import ContractSelector from './components/ContractSelector';
import NetworkSelector from './components/NetworkSelector';

export default function W3Header(props: {setConnection: React.Dispatch<Action>})
{
    const controller = React.useContext<IController>(ControllerContext);
    const connection = React.useContext<AppConnectionData>(ConnectionContext);

    return (
        <div className='bg-white flex py-[12px] shadow-md'>
            <APIStatus connected={connection.account !== ''} />
            <ContractSelector title='Contract' setConnection={props.setConnection} />
            <div className='m-auto' />
            <TestBalance setConnection={props.setConnection} />
            <NetworkSelector title='Network' setConnection={props.setConnection} />
            {
                connection.account !== '' ? <Account setConnection={props.setConnection} /> : <Connector setConnection={props.setConnection} />
            }
        </div>
    )
}
