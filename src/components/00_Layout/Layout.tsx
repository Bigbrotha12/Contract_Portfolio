import React from 'react';
import { Content } from '../../app/Definitions';

// Components
import Header from '../01_Header/Header';
import HeadShot from '../02_Content/HeadShot';
import Services from '../02_Content/Services';
import About from '../02_Content/About';
import Portfolio from '../02_Content/Portfolio';
import Skills from '../02_Content/Skills';
import Contact from '../02_Content/Contact';
import Footer from '../03_Footer/Footer';

// Images
import AboutImage from '../../assets/images/Andorra.png';
import DAppImage from '../../assets/images/dapp0.jpeg';
import GameImage from '../../assets/images/VideoGame.jpeg';
import CodeImage from '../../assets/images/Solidity.jpeg';
// Icons
import Solidity from '../../assets/icons/solidity.svg';
import Hardhat from '../../assets/icons/hardhat-icon.png';
import EthersJS from '../../assets/icons/ethersjs.svg';
const Git = "https://user-images.githubusercontent.com/25181517/192108372-f71d70ac-7ae6-4c0d-8395-51d8870c2ef0.png";
const HTML = "https://user-images.githubusercontent.com/25181517/192158954-f88b5814-d510-4564-b285-dff7d6400dad.png";
const CSS = "https://user-images.githubusercontent.com/25181517/183898674-75a4a1b1-f960-4ea9-abcb-637170a00a75.png";
const JS = "https://user-images.githubusercontent.com/25181517/117447155-6a868a00-af3d-11eb-9cfe-245df15c9f3f.png";
const TS = "https://user-images.githubusercontent.com/25181517/183890598-19a0ac2d-e88a-4005-a8df-1ee36782fde1.png";
const ReactJS = "https://user-images.githubusercontent.com/25181517/183897015-94a058a6-b86e-4e42-a37f-bf92061753e5.png";
const TailwindCSS = "https://user-images.githubusercontent.com/25181517/202896760-337261ed-ee92-4979-84c4-d4b829c7355d.png";
const MaterialUI = "https://user-images.githubusercontent.com/25181517/189716630-fe6c084c-6c66-43af-aa49-64c8aea4a5c2.png";
const NodeJS = "https://user-images.githubusercontent.com/25181517/183568594-85e280a7-0d7e-4d1a-9028-c8c2209e073c.png";
const CSharp = "https://user-images.githubusercontent.com/25181517/121405384-444d7300-c95d-11eb-959f-913020d3bf90.png";
const Rust = "https://user-images.githubusercontent.com/25181517/192599922-3a8ceb1c-ff1d-40bc-b73c-99ea1182d8ad.png";
const MongoDB = "https://user-images.githubusercontent.com/25181517/182884177-d48a8579-2cd0-447a-b9a6-ffc7cb02560e.png";
const AWS = "https://user-images.githubusercontent.com/25181517/183896132-54262f2e-6d98-41e3-8888-e40ab5a17326.png";
const Mocha = "https://user-images.githubusercontent.com/25181517/201476630-f47cfff6-fdee-4ee1-9092-1793b71b1ca3.png";


export default function Layout()
{
    const headerItem: Array<Content> = [
        { title: 'Home', icon: null, content: "#head" },
        { title: 'Services', icon: null, content: "#services" },
        { title: 'About', icon: null, content: "#about" },
        { title: 'Portfolio', icon: null, content: "#portfolio" },
        { title: 'Skills', icon: null, content: "#skills" }, 
        { title: 'Contact', icon: null, content: "#contact" }
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
                Thanks to this I was able to travel and live abroad while learning new cultures and ways of life. So far, I have lived in 5 different countries and visited over 30 different others. If I\'m not coding or traveling, you can find me playing a board game with friends over a cup of coffee.`
        },
        { title: 'Card 2', icon: AboutImage, content: 'Andorra' },
        {
            title: 'Card 3', icon: null, content:
                "Once I learned about Blockchain and became involved in the decentralized application space (mainly DeFi), I was intrigued about the possibilities and decided to make a career change into blockchain development. \n \
                I have been studying all I can about blockchain technology, DeFi space, and Solidity/Web3 development and began my journey into the industry. I truly believe this technology will revolutionize the way we interact with each other and I want to be a part of that."
        },
    ]
    const portfolioContent: Array<Content> = [
        { title: 'DApp Demo', icon: DAppImage, content: '/portfolio' },
        { title: 'NFT Game (In Progress)', icon: GameImage, content: 'https://arcane-familiars.netlify.app/' },
        { title: 'Code Repositories', icon: CodeImage, content: 'https://github.com/Bigbrotha12' },
    ]
    const skillContent: Array<Content> = [
        { title: 'Solidity', icon: Solidity, content: 'Memory layout, Types and Structures, ERC Standards' },
        { title: 'Hardhat', icon: Hardhat, content: 'Custom Deployment, Automated Testing, Blockchain Forking' },
        { title: 'Javascript/Typescript', icon: TS, content: 'DOM Manipulation, Asynchronous Programming, Classes/Interfaces' },
        { title: 'React', icon: ReactJS, content: 'State Management, Functional Components, Advanced/Custom Hooks' },
        { title: 'EthersJS', icon: EthersJS, content: 'RPC Providers, Smart Contract Interfacing, Cryptographic Functions' },
        { title: 'C#', icon: CSharp, content: 'Multi-threading, Polymorphism, Design Patterns' },
        { title: 'Rust', icon: Rust, content: 'Cargo, Ownership Rules, Pattern Matching' },
        { title: 'MongoDB', icon: MongoDB, content: 'Query construction, Pipelines, Commands' },
        { title: 'AWS', icon: AWS, content: 'EC2, Cloudfront, Lambda Functions, API Gateway' },
    ]

    return (
        <div className='w-full'>
            <Header title='Rafael' id='top' items={headerItem} />
            <HeadShot id='head' />
            <Services title='I can help you with...' id='services' content={servicesContent} />
            <About title='About me' id='about' content={aboutContent} />
            <Portfolio title='My Portfolio' id='portfolio' content={portfolioContent} />
            <Skills title='Skills and Tech Stack' id='skills' content={skillContent} />
            <Contact id='contact' />
            <Footer />
        </div>
    )
}