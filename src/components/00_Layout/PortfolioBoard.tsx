import React from 'react';
import { Action, AppConnectionData, Content } from '../../app/Definitions';
import { ConnectionContext } from '../../state/AppContext';

import Header from '../01_Header/Header';
import W3Header from '../01_Header/W3Header';
import InfoBanner from '../02_Content/InfoBanner';
import ContractInterface from '../02_Content/ContractInterface';
import EventTracker from '../02_Content/EventTracker';
import Airdrop from '../02_Content/contractComponents/Airdrop';
import Bridge from '../02_Content/contractComponents/Bridge';
import Flipper from '../02_Content/contractComponents/Flipper';
import NFTToken from '../02_Content/contractComponents/NFTToken';
import Reflect from '../02_Content/contractComponents/Reflect';
import Staker from '../02_Content/contractComponents/Staker';

export default function PortfolioBoard(props: {setConnection: React.Dispatch<Action>})
{
    const [infoBanner, setInfoBanner] = React.useState<string>('');
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
            <InfoBanner message={infoBanner} />
            <div className='flex px-[10%] mx-auto'>
                <ContractInterface><DisplayContract
                    contractName={connection.contract.name}
                    setConnection={props.setConnection}
                    setInfoBanner={setInfoBanner}
                /></ContractInterface>
                <EventTracker />
            </div>
        </div>
    )
}

function DisplayContract(props: { contractName: string, setConnection: React.Dispatch<Action>, setInfoBanner: React.Dispatch<React.SetStateAction<string>> })
    {
        switch (props.contractName)
        {
            case "Airdrop":
                return <Airdrop recipientCount={4} setConnection={props.setConnection} setInfoBanner={props.setInfoBanner}  />
            case "Bridge":
                return <Bridge setConnection={props.setConnection} setInfoBanner={props.setInfoBanner} />
            case "Flipper":
                return <Flipper setConnection={props.setConnection} setInfoBanner={props.setInfoBanner} />
            case "NFT":
                return <NFTToken setConnection={props.setConnection} setInfoBanner={props.setInfoBanner} />
            case "Reflect":
                return <Reflect setConnection={props.setConnection} setInfoBanner={props.setInfoBanner} />
            case "Staker":
                return <Staker setConnection={props.setConnection} setInfoBanner={props.setInfoBanner} />
            default:
                return <Airdrop recipientCount={4} setConnection={props.setConnection} setInfoBanner={props.setInfoBanner} />
        }
    }