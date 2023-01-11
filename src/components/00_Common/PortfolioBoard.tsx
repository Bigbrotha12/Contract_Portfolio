import React from 'react';
import Header from '../01_Header/Header';
import W3Header from '../01_Header/W3Header';
import InfoBanner from '../02_Content/InfoBanner';
import ContractInterface from '../02_Content/ContractInterface';
import EventTracker from '../02_Content/EventTracker';
import { Content } from './Definitions';

// ABI
import Airdrop from '../../../contracts/1_Airdrop/build/contracts/AirdropClaim.json';

export default function PortfolioBoard(props: {connection, setConnection})
{
    const headerItem: Array<Content> = [
        { title: 'Home', icon: null, content: "" },
        { title: 'Services', icon: null, content: "" },
        { title: 'About', icon: null, content: "" },
        { title: 'Rafael', icon: null, content: "" },
        { title: 'Portfolio', icon: null, content: "" },
        { title: 'Skills', icon: null, content: "" }, 
        { title: 'Contact', icon: null, content: "" }
    ]
    
    return (
        <div className='w-full min-h-screen bg-[#c5c5c5]'>
            <Header items={headerItem} />
            <W3Header connection={props.connection} setConnection={props.setConnection} />
            <InfoBanner />
            <div className='flex justify-center w-[80%] mx-auto'>
                <ContractInterface abi={Airdrop.abi} />
                <EventTracker />
            </div>
        </div>
    )
}