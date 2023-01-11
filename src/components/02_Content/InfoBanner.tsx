import React from 'react';
import Material from '../../assets/Material';

export default function InfoBanner()
{
    return (
        <div className='flex justify-center py-[24px]'>
            <div className=' bg-white border-[#242424] border-solid border-2 rounded-xl w-[80%] min-h-[80px] p-[12px]'>
                <Material.Typography>
                    <span className='font-bold'>Note: </span>
                    InfoBanner
                </Material.Typography>
            </div>
        </div>
    )
}