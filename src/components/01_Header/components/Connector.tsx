import React from 'react';
import Material from '../../../assets/Material';


export default function Connector(props: {accountConnect: () => void})
{
    return (
        <div className='flex align-middle py-auto px-[32px]'>
            <Material.Button onClick={props.accountConnect} variant='contained'>
                Connect
            </Material.Button>
        </div>
    )
}