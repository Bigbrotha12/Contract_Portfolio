import React from 'react';
import Material from '../../assets/Material';
import { Content } from '../00_Common/Definitions';

export default function Services(props: {title: string, id:string, content: Array<Content>})
{
    return (
        <div className='pt-[80px] pb-[48px] px-auto' id={props.id}>
            <div>
                <Material.Typography sx={{ fontFamily: 'inherit', textAlign: 'center' }} variant='h3' >
                    {props.title}
                </Material.Typography>
            </div>

            <div id='ServicesGrid'>
                <Material.Grid container sx={{margin: '0px', padding: '12px'} } spacing={4}>
                    {
                        props.content.map((card) => {
                            return (
                                <Material.Grid key={card.title} sm={6}>
                                    <Material.Card >
                                        <Material.CardHeader
                                            avatar={<Material.Avatar sx={{ bgcolor: 'rgb(30,100,80)' }}> </Material.Avatar>}
                                            titleTypographyProps={{ fontSize: '24px', fontFamily: 'inherit' }}
                                            title={card.title}
                                        />
                                        <Material.CardContent>
                                            {card.content}
                                        </Material.CardContent>
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