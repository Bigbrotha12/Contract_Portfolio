import React from 'react';
import Material from '../../assets/Material';

export default function Footer()
{
    return (
        <div className='bg-[#fafafa] pb-[12px] pt-[42px] px-auto'>
            <div className='ml-[42px]'>
                <Material.Typography sx={{ fontFamily: 'inherit' }} variant='h5'>Follow Me</Material.Typography>
                <div>
                    LinkedIn
                </div>
                <div>
                    Github
                </div>
                <div>
                    Twitter
                </div>
            </div>

            <div className='flex justify-center align-bottom'>
                <Material.Typography sx={{ fontFamily: 'inherit' }}><small>Copyright ©{new Date(Date.now()).getFullYear()} All rights reserved</small></Material.Typography>
            </div>
        </div>
    )
}