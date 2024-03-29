import React from 'react';
import Material from '../../assets/Material';
import { Content } from '../../app/Definitions';

export default function About(props: {title: string, id: string, content: Array<Content>})
{
    return (
        <div className='pt-[80px] pb-[48px] px-[16px] min-h-[300px]' id={props.id}>
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
                                <Material.Grid key={card.title} sm={12} md={4}>
                                    <Material.Card>
                                        {card.icon && <Material.CardMedia component='img' src={card.icon} />}
                                        <Material.CardContent sx={{lineHeight: "1.5"}}>{card.content}</Material.CardContent>
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