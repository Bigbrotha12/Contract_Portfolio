import React from 'react';
import Material from '../../assets/Material';

export default function About()
{
    return (
        <div className='py-[100px] px-[16px] min-h-[300px]'>
            <div id="TitleLabel">
                <Material.Typography variant='h5' sx={{ fontFamily: 'inherit' }}>
                    About Me
                </Material.Typography>
                <Material.Divider />
            </div>
            <div className='flex justify-evenly py-[32px]'>
                <div id="leftContainer" className='mx-[12px]'>
                    Container 1
                </div>
                <div id="centerContainer">
                    Container 2
                </div>
                <div id="rightContainer">
                    Container 3
                </div>
            </div>
           
        </div>
    )
}