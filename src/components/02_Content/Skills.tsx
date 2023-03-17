import React from 'react';
import Material from '../../assets/Material';
import { Content } from '../../app/Definitions';

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
                    props.content.map((content, index) => {
                        return (
                            <Material.Grid key={index} sm={6} md={3}>
                                <div className='flex text-center'>
                                   <img className='mr-[12px]' src={content.icon || ""} alt='icon' width='30rem' height='30rem' /> 
                                    <p className='my-auto'>{content.title}</p>
                                </div>
                                <ul className='my-[12px] pl-[32px] list-disc text-[#cbcbcb]'>
                                    {skillList(content.content)}
                                </ul>
                            </Material.Grid>
                        )
                    })
                }
                </Material.Grid>
            </div>
        </div>
    )
}

function skillList(content: string): Array<JSX.Element> {
    let result: Array<JSX.Element> = [];
    content.split(',').map((item, index) => {
        result.push(<li key={index}>{item}</li>)
    });
    return result;
}