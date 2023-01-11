import React from 'react';
import Material from '../../assets/Material';
import EventItem from './EventItem';

export default function EventTracker()
{
    return (
        <div className='ml-[12px] w-[30%]'>
            <Material.Card>
                <Material.CardHeader title="Event Tracker" />
                <Material.CardContent>
                    <EventItem />
                </Material.CardContent>
            </Material.Card>
        </div>
    )
}