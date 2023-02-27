import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppController from './app/AppController';
import IController from './app/IController';
import { ControllerContext } from './state/AppContext';
import { ConnectionContext } from './state/AppContext';
import Layout from './components/00_Layout/Layout';
import PortfolioBoard from './components/00_Layout/PortfolioBoard';
import { Action, AppConnectionData } from './app/Definitions';
import { defaultConnection } from './app/Networks';
import { useTheme, createTheme } from '@mui/material';

const theme = createTheme({

});

export default function App()
{
    const controller: IController = new AppController();
    const [connectionState, connectionDispatch] = React.useReducer(reducer, defaultConnection)

    function reducer(state: AppConnectionData, action: Action): AppConnectionData {
        switch (action.type) {
            case "ACCOUNT_CHANGE":
                return /^0x[A-Fa-f0-9]{40}$/.test(action.payload) ? 
                    { ...state, account: action.payload } :
                    state
            case "NETWORK_CHANGE":
                return { ...state, network: action.payload }
            case "CONTRACT_CHANGE":
                return { ...state, contract: action.payload }
            case "ADD_TRANSACTION":
                return { ...state, transactions: action.payload }
            case "DISCONNECT_ACCOUNT":
                return { ...state, account: '', walletMnemonics: '' }
            case "FALLBACK_WALLET":
                return { ...state, walletMnemonics: action.payload }
        }
    }

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