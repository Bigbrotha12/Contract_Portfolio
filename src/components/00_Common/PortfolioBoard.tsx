import React from 'react';
import Header from '../01_Header/Header';
import W3Header from '../01_Header/W3Header';
import InfoBanner from '../02_Content/InfoBanner';
import ContractInterface from '../02_Content/ContractInterface';
import EventTracker from '../02_Content/EventTracker';
import { AppConnectionData, Content } from './Definitions';

import Airdrop from '../02_Content/contractComponents/Airdrop';
import Bridge from '../02_Content/contractComponents/Bridge';
import Flipper from '../02_Content/contractComponents/Flipper';
import NFTToken from '../02_Content/contractComponents/NFTToken';
import Reflect from '../02_Content/contractComponents/Reflect';
import Staker from '../02_Content/contractComponents/Staker';

// ABI
//import Airdrop from '../../../contracts/1_Airdrop/build/contracts/AirdropClaim.json';

export default function PortfolioBoard(props: {connection: AppConnectionData, setConnection})
{
    React.useEffect(() => {
        window.scrollTo(0, 0)
    }, []);
    
    const headerItem: Array<Content> = [
        { title: 'Home', icon: null, content: "/" },
        { title: 'Services', icon: null, content: "/#services" },
        { title: 'About', icon: null, content: "/#about" },
        { title: 'Rafael', icon: null, content: "/#head" },
        { title: 'Portfolio', icon: null, content: "/#portfolio" },
        { title: 'Skills', icon: null, content: "/#skills" }, 
        { title: 'Contact', icon: null, content: "/#contact" }
    ]

    const displayContract = () =>
    {
        switch (props.connection.contract?.name)
        {
            case "Airdrop":
                return <Airdrop recipientCount={4} />
            case "Bridge":
                return <Bridge />
            case "Flipper":
                return <Flipper />
            case "NFT":
                return <NFTToken />
            case "Reflect":
                return <Reflect />
            case "Staker":
                return <Staker />
            default:
                return <Airdrop recipientCount={4} />
        }
    }
    
    return (
        <div className='w-full min-h-screen bg-gradientBg bg-cover'>
            
            <Header id='top' items={headerItem} />
            <W3Header connection={props.connection} setConnection={props.setConnection} />
            <InfoBanner />
            <div className='flex justify-center w-[80%] mx-auto'>
                <ContractInterface>{displayContract()}</ContractInterface>
                <EventTracker />
            </div>
        </div>
    )
}