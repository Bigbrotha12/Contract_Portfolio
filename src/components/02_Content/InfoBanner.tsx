import React from 'react';
import Material from '../../assets/Material';

export default function InfoBanner(props: {message: string, warning: string})
{
    return (
        <div className='flex justify-center py-[24px]'>
            <div className='bg-gradient-to-r from-[#242424] to-[#165fc7] rounded-[12px] min-h-[80px] p-[2px]'>
            <div className=' bg-white rounded-[10px] w-full min-h-[80px] p-[12px]'>
                <Material.Typography sx={{marginY: '12px'}}>
                    {props.message}
                </Material.Typography>
                
                {props.warning && <Material.Typography sx={{ marginY: '12px', padding: '12px', borderRadius: '12px', backgroundColor: '#ff9494'}}>
                    {"Error: " +  props.warning}
                </Material.Typography>}  
            </div>
            </div>
            
        </div>
    )
}