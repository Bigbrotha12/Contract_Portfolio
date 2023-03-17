import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppController from './app/AppController';
import IController from './app/IController';
import { ControllerContext, reducer } from './state/AppContext';
import { ConnectionContext } from './state/AppContext';
import Layout from './components/00_Layout/Layout';
import PortfolioBoard from './components/00_Layout/PortfolioBoard';
import { defaultConnection } from './app/Networks';
import { useTheme, createTheme } from '@mui/material';

const theme = createTheme({

});

export default function App()
{
    const controller: IController = new AppController();
    const [connectionState, connectionDispatch] = React.useReducer(reducer, defaultConnection)

    return (
        <div className='flex'>
            <React.StrictMode>
                <ControllerContext.Provider value={controller}>
                    <ConnectionContext.Provider value={connectionState}>
                    <BrowserRouter>
                        <Routes>
                            <Route path='/' element={<Layout />} />
                            <Route path='portfolio' element={<PortfolioBoard setConnection={connectionDispatch} />} />
                        </Routes>
                    </BrowserRouter>
                    </ConnectionContext.Provider>
                </ControllerContext.Provider>
            </React.StrictMode>
        </div>
    );
}