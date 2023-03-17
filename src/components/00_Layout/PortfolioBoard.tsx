import React from 'react';
import { Action, AppConnectionData, Content } from '../../app/Definitions';
import { ConnectionContext } from '../../state/AppContext';
import Material from '../../assets/Material';

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
import EmptyContract from '../02_Content/contractComponents/EmptyContract';

export default function PortfolioBoard(props: {setConnection: React.Dispatch<Action>})
{
    const [infoBanner, setInfoBanner] = React.useState<{ message: string, warning: string }>({ message: '', warning: '' });
    const connection: AppConnectionData = React.useContext(ConnectionContext); 
    const headerItem: Array<Content> = [
        { title: 'Home', icon: null, content: "/" },
        { title: 'Services', icon: null, content: "/#services" },
        { title: 'About', icon: null, content: "/#about" },
        { title: 'Portfolio', icon: null, content: "/#portfolio" },
        { title: 'Skills', icon: null, content: "/#skills" }, 
        { title: 'Contact', icon: null, content: "/#contact" }
    ]

    React.useEffect(() => {
        window.scrollTo(0, 0)
    }, []);

    return (
        <div className='w-full min-h-screen bg-gray-200'>
            
            <Header title='Rafael' id='top' items={headerItem} />
            <W3Header setConnection={props.setConnection} />
            <Material.Grid container spacing={2} justifyContent='center' marginX={'5%'}>

                <Material.Grid md={12}>
                    <InfoBanner message={infoBanner.message} warning={infoBanner.warning} />
                </Material.Grid>
            
                <Material.Grid md={connection.transactions.size === 0 ? 12 : 9} sm={12}>
                    <ContractInterface>
                        <DisplayContract
                            contractName={connection.contract.name}
                            setConnection={props.setConnection}
                            setInfoBanner={setInfoBanner}
                        />
                    </ContractInterface>
                </Material.Grid>

                <Material.Grid md={3} sm={12} visibility={connection.transactions.size === 0 ? 'hidden' : 'visible'}>
                    <EventTracker />
                </Material.Grid>
                
            </Material.Grid>
        </div>
    )
}

function DisplayContract(props: { contractName: string, setConnection: React.Dispatch<Action>, setInfoBanner: React.Dispatch<React.SetStateAction<{message: string, warning: string}>> })
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
                return <EmptyContract setConnection={props.setConnection} setInfoBanner={props.setInfoBanner} />
        }
    }