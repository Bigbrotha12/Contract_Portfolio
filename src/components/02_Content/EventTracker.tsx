import React from 'react';
import Material from '../../assets/Material';
import EventItem from './EventItem';
import { ConnectionContext } from '../../state/AppContext';
import { AppConnectionData } from '../../app/Definitions';

export default function EventTracker()
{
    const connection = React.useContext<AppConnectionData>(ConnectionContext);
    return (
        <Material.Card>
            <Material.CardHeader title="Event Tracker" />
            <Material.CardContent>
            {
                Array.from(connection.transactions.entries()).map((tx) => {
                    return (
                        connection.network.name === tx[1].network && <EventItem key={tx[0]} status={tx[1].status} hash={tx[0]} />
                    )
                })   
            }
            </Material.CardContent>
        </Material.Card>
    )
}