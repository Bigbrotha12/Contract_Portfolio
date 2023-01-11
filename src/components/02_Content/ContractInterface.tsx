import React from 'react';
import Material from '../../assets/Material';
import { ABIItem } from '../00_Common/Definitions';
import Airdrop from './contractComponents/Airdrop';

export default function ContractInterface(props: { abi: Array<ABIItem> })
{
    return (
        <div className='w-full'>
            <Material.Card>
                <Material.CardHeader title="Contract Interface" />
                <Airdrop recipientCount={2} />
            </Material.Card>
        </div>
    )
}