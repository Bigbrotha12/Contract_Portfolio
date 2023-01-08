import React from 'react';

export default function W3Header()
{
    return (
        <div className='flex justify-evenly py-[24px]'>
            <div id='Contract-drop-down'>Contract</div>
            <div id='Network-drop-down'>Network</div>
            <div id='Account-display'>Account</div>
            <div id='Connect Button'>Connect</div>
        </div>
    )
}