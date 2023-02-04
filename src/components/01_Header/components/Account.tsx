import React from 'react';
import { AppConnectionData } from '../../../app/Definitions';
import Material from '../../../assets/Material';
import { ConnectionContext } from '../../../state/AppContext';

export default function Account(props: {setConnection: React.Dispatch<React.SetStateAction<AppConnectionData>>})
{
    const connection = React.useContext<AppConnectionData>(ConnectionContext);

    function disconnect() {
        props.setConnection({ ...connection, account: '' });
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
    return address.length > 10 ? address.substring(0, 5) + "..." +  address.substring(address.length - 4) : address;
}