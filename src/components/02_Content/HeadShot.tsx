import React from 'react';
import FaceShot from '../../assets/images/FrontFace_800x800.png';
import Material from '../../assets/Material';

export default function HeadShot(props: {id: string})
{
    return (
        <div className='relative' id={props.id}>
            <div>
                <img src={FaceShot} className='ml-auto w-[800px] h-max-[800px]' />
            </div>
            <div className='relative md:absolute bottom-[20%] left-0 w-full pr-auto pl-[32px] mt-[12px] z-10'>
                <Material.Typography sx={{fontFamily: 'inherit'}} variant='h3'>
                    I'm Rafael <br /> Mendoza
                </Material.Typography>
                <Material.Typography sx={{fontFamily: 'inherit'}} variant='h6'>
                    and I'm a Blockchain Developer
                </Material.Typography>
            </div>
        </div>
    )
}