import React from 'react';
import { Router, Routes, Route } from 'react-router-dom';

import Layout from './components/00_Common/Layout';

export default function App()
{
    return (
        <div className='flex w-full'>
            <Layout />
        </div>
    );
}