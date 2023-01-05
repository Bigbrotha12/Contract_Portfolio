import React from 'react';
import Material from '../../assets/Material';

export default function Portfolio()
{
    return (
        <div>
            <div id='TitleLabel' className='w-full py-[48px]'>
                <Material.Typography sx={{ fontFamily: 'inherit', textAlign: 'center'}} variant='h3'>
                    My Portfolio
                </Material.Typography>
            </div>

            <div className=' bg-[#242424] h-[300px] px-auto'>
                <div className='m-auto p-[24px] w-[600px] overflow-y-hidden overflow-x-scroll whitespace-nowrap'>
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>  
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>
                    <Material.Card sx={{display: 'inline-block', width: '120px', height: '120px', margin: '12px'}}>
                        Card 1
                    </Material.Card>
                </div>
            </div>
            
        </div>
    )
}