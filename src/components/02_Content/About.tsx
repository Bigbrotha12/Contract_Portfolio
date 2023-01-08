import React from 'react';
import Material from '../../assets/Material';
import { Content } from '../00_Common/Definitions';

export default function About(props: {title: string, content: Array<Content>})
{
    return (
        <div className='py-[100px] px-[16px] min-h-[300px]'>
            <div id="TitleLabel" className='py-[48px] px-auto'>
                <Material.Typography sx={{ fontFamily: 'inherit', textAlign: 'center' }} variant='h3'>
                    {props.title}
                </Material.Typography>
            </div>

            <div className='flex justify-evenly py-[32px]'>
                <Material.Grid container spacing={2}>
                    {
                        props.content.map((card) => {
                            return (
                                <Material.Grid key={card.title} sm={4}>
                                    <Material.Card>
                                        {card.icon && <Material.CardMedia image={card.icon} />}
                                        <Material.CardContent>{card.content}</Material.CardContent>
                                    </Material.Card>
                                </Material.Grid>
                            )
                        })
                    }
                </Material.Grid>
            </div>
        </div>
    )
}