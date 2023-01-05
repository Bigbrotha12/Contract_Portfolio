import React from 'react';

import Header from '../01_Header/Header';
import HeadShot from '../02_Content/HeadShot';
import Services from '../02_Content/Services';
import About from '../02_Content/About';
import { LinkButton } from './Definitions';
import Portfolio from '../02_Content/Portfolio';
import Skills from '../02_Content/Skills';
import Contact from '../02_Content/Contact';
import Footer from '../03_Footer/Footer';

export default function Layout()
{
    const headerItem: Array<LinkButton> = [
        { label: 'Home', icon: null, link: null },
        { label: 'Services', icon: null, link: null },
        { label: 'About', icon: null, link: null },
        { label: 'Rafael', icon: null, link: null },
        { label: 'Portfolio', icon: null, link: null },
        { label: 'Skills', icon: null, link: null }, 
        { label: 'Contact', icon: null, link: null }
    ]
    return (
        <div className='w-full'>
            <Header items={headerItem} />
            <HeadShot />
            <Services />
            <About />
            <Portfolio />
            <Skills />
            <Contact />
            <Footer />
        </div>
    )
}