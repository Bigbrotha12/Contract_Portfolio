import React from 'react';
import { AppConnectionData, TransactionStatus } from '../../app/Definitions';
import Material from '../../assets/Material';
import { ConnectionContext } from '../../state/AppContext';

export default function EventItem(props: {status: TransactionStatus, hash: string})
{
    const connection = React.useContext<AppConnectionData>(ConnectionContext);

    return (
        <div>
            <Material.Card>
                <Material.Typography sx={{ paddingLeft: '6px', paddingTop: '6px' }}>Status: {props.status.toString()}</Material.Typography>
                
                <Material.CardContent>
                    {props.hash}
                </Material.CardContent>

                <Material.CardActions>
                    <a href={connection.network.explorer + '/tx/' + props.hash}>View in Explorer</a>
                </Material.CardActions>
            </Material.Card>
        </div>
    )
}
