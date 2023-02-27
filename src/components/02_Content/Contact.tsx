import React from 'react';
import { Content } from '../../app/Definitions';
import Material from '../../assets/Material';
import formSpreeIcon from '../../assets/icons/FormSpreeLogo.png';

export default function Contact(props: {id: string})
{
    

    return (
        <div id={props.id} className='pt-[80px] pb-[48px] px-auto'>
            <div className='mb-[12px]'>
                <Material.Typography sx={{ fontFamily: 'inherit', textAlign: 'center' }} variant='h3'>
                    Contact Me
                </Material.Typography>
            </div>

            <form className='bg-[#ffffff] pb-[32px] px-auto' action="https://formspree.io/f/mleaajdb" id="contact-form" method="POST">
                <Material.Box sx={{ '& .MuiTextField-root': { m: 1 }}}>
                    <div className='flex justify-center'>
                        <Material.TextField sx={{ width: '40%' }} inputProps={{ name: 'First_Name' }} label="First Name" />
                        <Material.TextField sx={{width: '39%'}} inputProps={{ name: 'Last_Name' }} label="Last Name" />  
                    </div>
                    <div className='flex justify-center'>
                        <Material.TextField sx={{width: '80%'}} inputProps={{ name: 'Email' }} label="E-mail Address" />
                    </div>
                    <div className='flex justify-center'>
                        <Material.TextField sx={{width: '80%'}} inputProps={{ name: 'Subject' }} label="Subject of message" />
                    </div>
                    <div className='flex justify-center'>
                        <Material.TextField sx={{ width: '80%' }} inputProps={{ name: 'Message' }} label="Message" multiline minRows={4} placeholder='Type your message here...' />
                    </div>
                    <div className='flex justify-center'>
                        <Material.Button sx={{width: '80%'}}variant='contained' fullWidth type='submit'>
                            Submit
                        </Material.Button>
                    </div>
                    <div className='flex justify-end pr-[10%] pt-[12px]'>
                        <small>Powered by <img className='inline-block ml-3' src={formSpreeIcon} width='64rem' height='64rem' alt='FormSpree'/></small>
                    </div>
                </Material.Box>
            </form>
        </div>
    )
}