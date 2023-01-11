import React from 'react';
import AppController from '../app/AppController';
import IController from '../app/IController';

export const ControllerContext = React.createContext<IController>(new AppController());
