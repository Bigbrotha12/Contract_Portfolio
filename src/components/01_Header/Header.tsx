import React from 'react';
import Material from '../../assets/Material';
import { LinkButton } from '../00_Common/Definitions';

export default function Header(props: {items: Array<LinkButton>})
{
    return (
        <div className='bg-slate-800 text-white py-[12px] flex justify-evenly w-full min-h-[48px]'>
            
            {
                props.items.map((headerItem, index) => {
                    return <Material.Link key={index} sx={{ marginTop: 'auto', fontSize: Math.floor(props.items.length / 2) == index ? '32px' : '16px'}} href={headerItem.link || ''} underline='hover' color='primary'>{headerItem.label}</Material.Link>
                })
            }
            
        </div>
    )
}