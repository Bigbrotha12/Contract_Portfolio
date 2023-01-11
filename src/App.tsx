import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppController from './app/AppController';
import IController from './app/IController';
import { ControllerContext } from './state/AppContext';

import Layout from './components/00_Common/Layout';
import PortfolioBoard from './components/00_Common/PortfolioBoard';
import { AppConnectionData } from './components/00_Common/Definitions';

export default function App()
{
    const controller: IController = new AppController();
    const [connection, setConnection] = React.useState<AppConnectionData | null>(null);
    
    return (
        <div className='flex w-full'>
            <React.StrictMode>
                <ControllerContext.Provider value={controller}>
                    <BrowserRouter>
                        <Routes>
                            <Route path='/' element={<Layout />} />
                            <Route path='portfolio' element={<PortfolioBoard connection={connection} setConnection={setConnection} />} />
                        </Routes>
                        </BrowserRouter>
                    </ControllerContext.Provider>
            </React.StrictMode>
        </div>
    );
}