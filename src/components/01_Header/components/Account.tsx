import React from 'react';
import Material from '../../../assets/Material';

export default function Account(props: {account: string})
{
    return (
        <div className='flex align-middle py-[12px] px-[32px]'>
            <Material.Button variant='outlined'>
                <Material.Typography>{shortAddress(props.account)}</Material.Typography>
            </Material.Button>
        </div>
    )
}

function shortAddress(address: string)
{
    return address.length > 10 ? address.substring(0, 5) + "..." +  address.substring(address.length - 4) : address;
}