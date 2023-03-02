import React from 'react';
import { Action, AppConnectionData } from '../../app/Definitions';
import { ConnectionContext } from '../../state/AppContext';

import APIStatus from './components/APIStatus';
import Connector from './components/Connector';
import TestBalance from './components/TestBalance';
import Account from './components/Account';
import ContractSelector from './components/ContractSelector';
import NetworkSelector from './components/NetworkSelector';

export default function W3Header(props: {setConnection: React.Dispatch<Action>})
{
    const connection = React.useContext<AppConnectionData>(ConnectionContext);

    return (
        <div className='bg-white flex py-[12px] shadow-md'>
            <div className='hidden md:block'><APIStatus connected={connection.account !== ''} /></div>
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
