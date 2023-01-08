import React from 'react';
import { Content } from './Definitions';
import Header from '../01_Header/Header';
import HeadShot from '../02_Content/HeadShot';
import Services from '../02_Content/Services';
import About from '../02_Content/About';
import Portfolio from '../02_Content/Portfolio';
import Skills from '../02_Content/Skills';
import Contact from '../02_Content/Contact';
import Footer from '../03_Footer/Footer';

export default function Layout()
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
    const servicesContent: Array<Content> = [
        { title: 'Smart Contract Design', icon: null, content: 'I will design, write, and deploy smart contracts for Ethereum, Binance Smart Chain, or other EVM-compatible blockchains according to your user requirement. Smart contracts will be developed in accordance with latest security recommendations' },
        { title: 'Web3 Integration', icon: null, content: 'Bring the power of blockchain directly to your customers. I will work with your team to integrate your existing website to the world of Blockchain via Web3. You and your users will be able to interact with your own or any third-party smart contracts directly from your site.' },
        { title: 'Cryptocurrency Launch', icon: null, content: 'I will create a Cryptocurrency token for your project or community with custom functionality such as gasless staking, fee-on-transaction, auto-liquidity provisions, etc. I can work with standard ERC20 tokens as well as ERC223 or ERC721 (NFTs).' },
        { title: 'Decentralized Applications (DApps)', icon: null, content: 'I will develop a decentralized application for your project utilizing blockchain smart contracts in the back-end and simple front-end website interface hosted via IPFS. Leverage the power of decentralization to create truly unstoppable, censorship-resistant applications!' },
        { title: 'Education', icon: null, content: 'I have been involved in the blockchain space since 2017 as a crypto-enthusiast and the last year as a blockchain developer. I would be more than happy to help you understand the benefits and use-cases of blockchain, show you how to interact with Dapps (such as DeFi), run your own personal blockchain, or help answer any questions you may have.' },
        { title: 'And more...', icon: null, content: 'If you are new to the blockchain space or already have an existing start-up and need additional support, you are very welcome to reach out to discuss how I can help you. Whether it be smart contract development, unit or end-to-end testing, or just to chat about blockchain, I\'m happy to support.' }
    ]
    const aboutContent: Array<Content> = [
        {
            title: 'Card 1', icon: null, content:
                `Born and raised in the Dominican Republic. I studied in the International Business master program at the University of Florida and worked for a large multinational company as Accountant/Controller for the past 7 years. 
                Thanks to this I was able to travel and live abroad while learning new cultures and ways of life. So far, I have lived in 5 different countries and visited over 30 different others. If I\'m not coding or traveling, you can find me playing a game of chess with friends over a cup of coffee.`
        },
        { title: 'Card 2', icon: 'picture', content: '' },
        {
            title: 'Card 3', icon: null, content:
                `Once I learned about Blockchain and became involved in the decentralized application space (mainly DeFi), I was intrigued about the possibilities and decided to make a career change into blockchain development. 
                I have been studying all I can about blockchain technology, DeFi space, and Solidity/Web3 development and began my journey into the industry. I truly believe this technology will revolutionize the way we interact with each other and I want to be a part of that.`
        },
    ]
    const portfolioContent: Array<Content> = [
        { title: 'ERC20', icon: null, content: ''},
        { title: 'Bridge', icon: 'picture', content: '' },
        { title: 'NFT', icon: null, content: '' }
    ]
    const skillContent: Array<Content> = [
        { title: 'Typescript', icon: null, content: '' },
        { title: 'Solidity', icon: 'picture', content: '' },
        { title: 'C#', icon: null, content: '' },
        { title: 'Rust', icon: null, content: '' },
    ]

    return (
        <div className='w-full'>
            <Header items={headerItem} />
            <HeadShot />
            <Services title='I can help you with...' content={servicesContent} />
            <About title='About me' content={aboutContent} />
            <Portfolio title='My Portfolio' content={portfolioContent} />
            <Skills title='Skills and Tech Stack' content={skillContent} />
            <Contact />
            <Footer />
        </div>
    )
}