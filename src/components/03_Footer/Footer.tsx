import React from 'react';
import Material from '../../assets/Material';

// icons
import LinkedInIcon from '../../assets/icons/linkedin-icon.png';
import TwitterIcon from '../../assets/icons/twitter-icon01.png';
import GithubIcon from '../../assets/icons/github-mark.png';

export default function Footer()
{
    return (
        <div className='bg-[#fafafa] pb-[12px] pt-[42px] px-auto'>
            <div className='ml-[42px] pb-[12px]'>
                <Material.Typography sx={{ fontFamily: 'inherit', fontWeight: 'bold' }} variant='h5'>
                    Follow Me
                </Material.Typography>
                <a className='flex decoration-inherit my-[12px]' href='https://www.linkedin.com/in/rafaelmendoza64/'>
                    <img className='inline-block mr-[12px]' src={LinkedInIcon} alt='Linked'  width='30px' height='30px'/>
                    <Material.Typography sx={{ fontFamily: 'inherit' }} variant='h5'>
                        LinkedIn
                    </Material.Typography>
                </a>
                <a className='flex decoration-inherit my-[12px]' href='https://twitter.com/RafaelM27764900'>
                <img className='inline-block mr-[12px]' src={TwitterIcon} alt='Twitter'  width='30px' height='30px'/>
                    <Material.Typography sx={{ fontFamily: 'inherit' }} variant='h5'>
                        Twitter
                    </Material.Typography>
                </a>
                <a className='flex decoration-inherit my-[12px]' href='https://github.com/Bigbrotha12'>
                    <img className='inline-block mr-[12px]' src={GithubIcon} alt='Github'  width='30px' height='30px'/>
                    <Material.Typography sx={{ fontFamily: 'inherit' }} variant='h5'>
                        Github
                    </Material.Typography>
                </a>
            </div>

            <div className='flex justify-center align-bottom'>
                <Material.Typography sx={{ fontFamily: 'inherit' }}><small>Copyright ©{new Date(Date.now()).getFullYear()} All rights reserved</small></Material.Typography>
            </div>
        </div>
    )
}