import React from 'react';
import FaceShot from '../../assets/images/FrontFace.png';
import Material from '../../assets/Material';

export default function HeadShot()
{
    return (
        <div className='h-[900px] flex justify-end'>
            <div className='w-full pr-auto pl-[32px] my-auto z-10'>
                <Material.Typography sx={{fontFamily: 'inherit'}} variant='h3'>
                    I'm Rafael <br /> Mendoza
                </Material.Typography>
                <Material.Typography sx={{fontFamily: 'inherit'}} variant='h6'>
                    and I'm a Blockchain Developer
                </Material.Typography>
            </div>
            <div className='absolute'>
                <img src={FaceShot} height='800px' width='800px' />
            </div>
        </div>
    )
}