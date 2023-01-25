import React from 'react';
import Header from '../01_Header/Header';
import W3Header from '../01_Header/W3Header';
import InfoBanner from '../02_Content/InfoBanner';
import ContractInterface from '../02_Content/ContractInterface';
import EventTracker from '../02_Content/EventTracker';
import { AppConnectionData, Content } from '../../app/Definitions';

import Airdrop from '../02_Content/contractComponents/Airdrop';
import Bridge from '../02_Content/contractComponents/Bridge';
import Flipper from '../02_Content/contractComponents/Flipper';
import NFTToken from '../02_Content/contractComponents/NFTToken';
import Reflect from '../02_Content/contractComponents/Reflect';
import Staker from '../02_Content/contractComponents/Staker';
import { ConnectionContext } from '../../state/AppContext';

export default function PortfolioBoard(props: {setConnection: React.Dispatch<React.SetStateAction<AppConnectionData>>})
{
    React.useEffect(() => {
        window.scrollTo(0, 0)
    }, []);

    const connection: AppConnectionData = React.useContext(ConnectionContext); 
    const headerItem: Array<Content> = [
        { title: 'Home', icon: null, content: "/" },
        { title: 'Services', icon: null, content: "/#services" },
        { title: 'About', icon: null, content: "/#about" },
        { title: 'Rafael', icon: null, content: "/#head" },
        { title: 'Portfolio', icon: null, content: "/#portfolio" },
        { title: 'Skills', icon: null, content: "/#skills" }, 
        { title: 'Contact', icon: null, content: "/#contact" }
    ]

    return (
        <div className='w-full min-h-screen bg-gradientBg bg-cover'>
            
            <Header id='top' items={headerItem} />
            <W3Header setConnection={props.setConnection} />
            <InfoBanner />
            <div className='flex px-[10%] mx-auto'>
                <ContractInterface><DisplayContract contractName={connection.contract.name} /></ContractInterface>
                <EventTracker />
            </div>
        </div>
    )
}

function DisplayContract(props: { contractName: string })
    {
        switch (props.contractName)
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