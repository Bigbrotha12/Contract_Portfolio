import React from 'react';
import { Action, AppConnectionData } from '../../../app/Definitions';
import Material from '../../../assets/Material';
import { ConnectionContext } from '../../../state/AppContext';

export default function Account(props: {setConnection: React.Dispatch<Action>})
{
    const connection = React.useContext<AppConnectionData>(ConnectionContext);

    function disconnect() {
        props.setConnection({ type: "ACCOUNT_CHANGE", payload: '' });
    }

    return (
        <div className='flex align-middle px-[32px]'>
            <Material.Button onClick={disconnect}>
                <Material.Chip label={shortAddress(connection.account)} variant='outlined'/>
            </Material.Button>
        </div>
    )
}

function shortAddress(address: string)
{
    return address.length > 10 ? address.substring(0, 6) + "..." +  address.substring(address.length - 5) : address;
}