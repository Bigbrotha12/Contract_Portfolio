import React from 'react';
import Header from '../01_Header/Header';
import W3Header from '../01_Header/W3Header';
import InfoBanner from '../02_Content/InfoBanner';
import ContractInterface from '../02_Content/ContractInterface';
import EventTracker from '../02_Content/EventTracker';
import { Content } from './Definitions';

export default function PortfolioBoard()
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
        <div className='w-full'>
            <Header items={headerItem} />
            <W3Header />
            <InfoBanner />
            <div className='flex justify-center'>
                <ContractInterface />
                <EventTracker />
            </div>
        </div>
    )
}