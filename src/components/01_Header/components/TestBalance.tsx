import React from 'react';
import Material from '../../../assets/Material';

export default function TestBalance()
{
    return (
        <div className='my-auto px-[32px]'>
            <Material.Chip label={'TestTokens: 50000000'} variant='outlined'></Material.Chip>
        </div>
    )
}