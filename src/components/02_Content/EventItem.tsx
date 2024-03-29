import React from 'react';
import { AppConnectionData, TransactionStatus } from '../../app/Definitions';
import Material from '../../assets/Material';
import { ConnectionContext } from '../../state/AppContext';

export default function EventItem(props: {status: TransactionStatus, hash: string})
{
    const connection = React.useContext<AppConnectionData>(ConnectionContext);

    return (
        <div className='my-[12px]'>
            <Material.Card>
                <Material.Typography sx={{ paddingLeft: '6px', paddingTop: '6px' }}>Status: {statusParser(props.status)}</Material.Typography>
                
                <Material.CardContent sx={{paddingX: 'auto'}}>
                    {shortAddress(props.hash)}
                </Material.CardContent>

                <Material.CardActions>
                    <Material.Button onClick={() => {
                        window.open(connection.network.explorer + '/tx/' + props.hash, "_blank")?.focus();
                    }}>View in Explorer</Material.Button>
                </Material.CardActions>
            </Material.Card>
        </div>
    )
}

function statusParser(status: TransactionStatus): string {
    switch (status) {
        case TransactionStatus.DRAFT:
            return "Draft";
        case TransactionStatus.PENDING:
            return "Pending";
        case TransactionStatus.CONFIRMED:
            return "Confirmed";
        default:
            return "Unknown";
    }
}

function shortAddress(address: string): string {
    return address.length > 10 ? address.substring(0, 6) + "..." +  address.substring(address.length - 5) : address;
}
