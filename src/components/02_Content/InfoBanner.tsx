import React from 'react';
import Material from '../../assets/Material';

export default function InfoBanner()
{
    return (
        <div className='flex justify-center py-[24px]'>
            <div className='border-solid border-2 rounded-xl w-[80%] min-h-[80px] p-[12px]'>
                <Material.Typography>InfoBanner</Material.Typography>
            </div>
        </div>
    )
}