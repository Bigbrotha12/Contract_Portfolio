import React from 'react';
import Material from '../../assets/Material';
import { Link } from 'react-router-dom';
import { Content } from '../../app/Definitions';

export default function Portfolio(props: { title: string, id: string, content: Array<Content> })
{
    return (
        <div className='bg-[#242424] text-white' id={props.id}>
            <div className='w-full pt-[80px] pb-[48px]'>
                <Material.Typography sx={{ fontFamily: 'inherit', textAlign: 'center'}} variant='h3'>
                    {props.title}
                </Material.Typography>
            </div>

            <Material.Grid container sx={{marginX: '24px', paddingY: '32px', paddingX: 'auto'}} spacing={0}>
                    {
                        props.content.map(content => {
                            return (
                                <Material.Grid key={content.title} sm={12} md={6}>
                                
                                    <Material.Card key={content.title} sx={{maxHeight: '360px', position: 'relative'}}>
                                        <Material.CardHeader title={content.title} titleTypographyProps={{textAlign: 'center', fontFamily: 'inherit'}} />
                                        <Material.CardMedia component='img' image={content.icon || ''} alt='image' />
                                        <Material.CardActions sx={{position: 'absolute', bottom: '12px'}}>
                                            <Material.Button sx={{backgroundColor: '#242424'}}  variant='contained'>
                                            <Link
                                                to={content.content}
                                                onClick={() => {
                                                    if (content.content.startsWith('https')) {
                                                        window.location.replace(content.content)
                                                    }
                                                }}
                                                >
                                                    Live Site
                                            </Link>
                                            </Material.Button>
                                            <Material.Button sx={{backgroundColor: '#242424'}} variant='contained'>Video Demo</Material.Button>
                                            <Material.Button sx={{backgroundColor: '#242424'}} variant='contained'>Source Code</Material.Button>
                                        </Material.CardActions>
                                    </Material.Card>
                                
                                </Material.Grid>
                            )
                        })
                    }
                
            </Material.Grid>
            
        </div>
    )
}