import React from 'react';
import Material from '../../assets/Material';
import { Content } from '../00_Common/Definitions';

export default function Skills(props: { title: string, id: string, content: Array<Content> })
{
    return (
        <div className='bg-[#242424] text-white pt-[80px] pb-[48px] px-auto' id={props.id}>
            <div>
                <Material.Typography sx={{ fontFamily: 'inherit', textAlign: 'center' }} variant='h3' >
                    {props.title}
                </Material.Typography>
            </div>

            <div className='py-[48px] px-auto '>
                <Material.Grid sx={{margin: '0px', paddingX: '10%'} } container spacing={2}>
                {
                    props.content.map(content => {
                        return (
                            <Material.Grid key={content.title} sm={3}>
                                {content.title}
                                {content.content}
                            </Material.Grid>
                        )
                    })
                }
                </Material.Grid>
            </div>
        </div>
    )
}