import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppController from './app/AppController';
import IController from './app/IController';
import { ControllerContext } from './state/AppContext';
import { ConnectionContext } from './state/AppContext';
import Layout from './components/00_Common/Layout';
import PortfolioBoard from './components/00_Common/PortfolioBoard';
import { AppConnectionData } from './components/00_Common/Definitions';
import { defaultConnection } from './app/Networks';
import { useTheme, createTheme } from '@mui/material';

const theme = createTheme({

});

export default function App()
{
    const controller: IController = new AppController();
    const [connection, setConnection] = React.useState<AppConnectionData>(defaultConnection);
    console.log(defaultConnection);
    return (
        <div className='flex'>
            <React.StrictMode>
                <ControllerContext.Provider value={controller}>
                    <ConnectionContext.Provider value={connection}>
                    <BrowserRouter>
                        <Routes>
                            <Route path='/' element={<Layout />} />
                            <Route path='portfolio' element={<PortfolioBoard setConnection={setConnection} />} />
                        </Routes>
                    </BrowserRouter>
                    </ConnectionContext.Provider>
                </ControllerContext.Provider>
            </React.StrictMode>
        </div>
    );
}