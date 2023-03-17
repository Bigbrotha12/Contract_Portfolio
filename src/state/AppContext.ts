import React from 'react';
import AppController from '../app/AppController';
import IController from '../app/IController';
import { defaultConnection } from '../app/Networks';
import { Action, AppConnectionData } from '../app/Definitions';

export const ControllerContext = React.createContext<IController>(new AppController());
export const ConnectionContext = React.createContext<AppConnectionData>(defaultConnection);
export function reducer(state: AppConnectionData, action: Action): AppConnectionData {
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