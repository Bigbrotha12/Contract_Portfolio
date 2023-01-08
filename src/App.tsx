import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './components/00_Common/Layout';
import PortfolioBoard from './components/00_Common/PortfolioBoard';

export default function App()
{
    return (
        <div className='flex w-full'>
            <React.StrictMode>
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<Layout />} />
                        <Route path='portfolio' element={<PortfolioBoard />} />
                    </Routes>
                </BrowserRouter>
            </React.StrictMode>
        </div>
    );
}