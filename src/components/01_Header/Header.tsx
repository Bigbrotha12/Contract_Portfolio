import React from 'react';
import Material from '../../assets/Material';
import { Content } from '../00_Common/Definitions';

export default function Header(props: {items: Array<Content>})
{
    return (
        <div className='bg-[#242424] text-white py-[12px] flex justify-evenly w-full min-h-[48px]'>
            
            {
                props.items.map((headerItem, index) => {
                    return <Material.Link key={headerItem.title} sx={{ marginTop: 'auto', color: 'white', fontSize: Math.floor(props.items.length / 2) == index ? '32px' : '16px'}} href={headerItem.content || ''} underline='hover' color='primary'>{headerItem.title}</Material.Link>
                })
            }
            
        </div>
    )
}