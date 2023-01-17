import React from 'react';
import Material from '../../assets/Material';
import { Link } from 'react-router-dom';
import { Content } from '../00_Common/Definitions';

export default function Portfolio(props: { title: string, id: string, content: Array<Content> })
{
    return (
        <div className='bg-[#242424] text-white' id={props.id}>
            <div className='w-full pt-[80px] pb-[48px]'>
                <Material.Typography sx={{ fontFamily: 'inherit', textAlign: 'center'}} variant='h3'>
                    {props.title}
                </Material.Typography>
            </div>

            <div className='py-[32px] px-auto'>
                <div className='m-auto p-[24px] w-[80%] overflow-y-hidden overflow-x-scroll whitespace-nowrap'>
                    {
                        props.content.map(content => {
                            return (
                                <Link key={content.title} to={content.content} onClick={() => window.location.replace(content.content)}>
                                    <Material.Card key={content.title} sx={{ display: 'inline-block', width: '320px', height: '320px', margin: '12px' }}>
                                        <Material.CardHeader title={content.title} titleTypographyProps={{textAlign: 'center', fontFamily: 'inherit'}} />
                                        <Material.CardMedia component='img' image={content.icon || '' } alt='image' />
                                    </Material.Card>
                                </Link>
                            )
                        })
                    }
                </div>
            </div>
            
        </div>
    )
}