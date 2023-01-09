import React from 'react';
import { IndexedCallback } from '../00_Common/Definitions';
import APIStatus from './components/APIStatus';
import Connector from './components/Connector';
import Account from './components/Account';
import Selector from './components/Selector';

export default function W3Header()
{
    const Contractcallback: IndexedCallback = (index: number) =>
    {
        console.log('Callback received: ' + index);
    }

    const Networkcallback: IndexedCallback = (index: number) =>
    {
        console.log('Callback received: ' + index);
    }

    return (
        <div className='flex py-[12px] shadow-md'>
            <APIStatus />
            <Selector title='Contract' options={['NFT', 'Bridge', 'ERC20']} callback={Contractcallback} />
            <div className='m-auto' />
            <Selector title='Network' options={['Ethereum', 'Binance', 'Goerli']} callback={Networkcallback} />
            <Account account='0x99C5ED73841f0d652D56e5616e4b2Db6996c9707' />
        </div>
    )
}