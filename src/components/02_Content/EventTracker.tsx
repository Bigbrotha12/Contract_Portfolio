import React from 'react';
import Material from '../../assets/Material';

export default function EventTracker()
{
    return (
        <div className='ml-[12px]'>
            <Material.Card>
                <Material.CardHeader title="Event Tracker" />
                <Material.CardContent>
                    List of events
                </Material.CardContent>
            </Material.Card>
        </div>
    )
}