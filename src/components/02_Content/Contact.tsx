import React from 'react';
import { Content } from '../00_Common/Definitions';
import Material from '../../assets/Material';
import { useForm } from 'react-hook-form';

export default function Contact(props: {id: string})
{
    const { register, handleSubmit, setError, formState: { errors } } = useForm();
    function handleContactData(data) {
        console.log(data);
    }

    return (
        <div id={props.id} className='pt-[80px] pb-[48px] px-auto'>
            <div className='mb-[12px]'>
                <Material.Typography sx={{ fontFamily: 'inherit', textAlign: 'center' }} variant='h3'>
                    Contact Me
                </Material.Typography>
            </div>

            <div className='bg-[#ffffff] pb-[32px] px-auto'>
                <Material.Box sx={{ '& .MuiTextField-root': { m: 1 }}} component='form' onSubmit={handleSubmit(handleContactData)} autoComplete='off'>
                    <div className='flex justify-center'>
                        <Material.TextField sx={{ width: '40%' }} inputProps={{ ...register("firstName") }} label="First Name" />
                        <Material.TextField sx={{width: '39%'}} inputProps={{ ...register("lastName") }} label="Last Name" />  
                    </div>
                    <div className='flex justify-center'>
                        <Material.TextField sx={{width: '80%'}} inputProps={{ ...register("email") }} label="E-mail Address" />
                    </div>
                    <div className='flex justify-center'>
                        <Material.TextField sx={{width: '80%'}} inputProps={{ ...register("subject") }} label="Subject of message" />
                    </div>
                    <div className='flex justify-center'>
                        <Material.TextField sx={{ width: '80%' }} inputProps={{ ...register("message") }} label="Message" multiline minRows={4} placeholder='Type your message here...' />
                    </div>
                    <div className='flex justify-center'>
                        <Material.Button variant='contained' fullWidth type='submit'>
                            Submit
                        </Material.Button>
                    </div>
                </Material.Box>
            </div>
        </div>
    )
}