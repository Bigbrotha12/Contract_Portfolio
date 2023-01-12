import React from 'react';
import { Content } from '../00_Common/Definitions';
import Material from '../../assets/Material';
import { width } from '@mui/system';

export default function Contact(props: {id: string})
{
    return (
        <div id={props.id} className='pt-[80px] pb-[48px] px-auto'>
            <div>
                <Material.Typography sx={{ fontFamily: 'inherit', textAlign: 'center' }} variant='h3'>
                    Contact Me
                </Material.Typography>
            </div>

            <div className=' bg-[#ffffff] pb-[32px] px-auto'>
                <Material.Box sx={{ '& .MuiTextField-root': { m: 1 }}} component='form' autoComplete='off'>
                    <div className='flex justify-center'>
                        <Material.TextField sx={{width: '40%'}} label="First Name" />
                        <Material.TextField sx={{width: '39%'}} label="Last Name" />  
                    </div>
                    <div className='flex justify-center'>
                        <Material.TextField sx={{width: '80%'}} label="E-mail Address" />
                    </div>
                    <div className='flex justify-center'>
                        <Material.TextField sx={{width: '80%'}} label="Subject of message" />
                    </div>
                    <div className='flex justify-center'>
                        <Material.TextField sx={{ width: '80%' }} label="Message" multiline rows={4} placeholder='Type your message here...' />
                    </div>
                    <div className='flex justify-center'>
                        <Material.Button variant='contained' type='submit'>
                            Submit
                        </Material.Button>
                    </div>
                   
                </Material.Box>
            </div>
        </div>
    )
}