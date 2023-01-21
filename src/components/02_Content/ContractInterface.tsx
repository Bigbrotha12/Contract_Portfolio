import React from 'react';
import Material from '../../assets/Material';

export default function ContractInterface({ children })
{
    return (
        <div className='w-full'>
            <Material.Card>
                <Material.CardHeader title="Contract Interface" />
                {children}
            </Material.Card>
        </div>
    )
}