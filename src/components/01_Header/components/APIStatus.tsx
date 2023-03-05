import React from 'react';
import Material from '../../../assets/Material';

export default function APIStatus(props: {connected: boolean})
{
    return (
        <div className='hidden lg:flex mr-[12px]'>
            <div className='my-auto px-[12px]'>
                <Material.Typography fontFamily='inherit'>Status</Material.Typography>
            </div>
            
            <div className={'my-auto h-auto w-auto ' + `${props.connected ? 'text-green-500' : 'text-[#ab4141]'}`}>
            <Material.Icon sx={{ height: 'auto', width: 'auto' }} color='inherit'><Material.CircleIcon /></Material.Icon>
            </div>
        </div>
    )
}