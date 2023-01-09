import React from 'react';
import Material from '../../../assets/Material';

export default function APIStatus()
{
    return (
        <div className='flex w-[20%]'>
            <div className='my-auto px-[24px]'>
                <Material.Typography fontFamily='inherit'>Status</Material.Typography>
            </div>
            
            <div className='text-[#ab4141] my-auto h-auto w-auto'>
            <Material.Icon sx={{ height: 'auto', width: 'auto' }} color='inherit'><Material.CircleIcon /></Material.Icon>
            </div>
        </div>
    )
}