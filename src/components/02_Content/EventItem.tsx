import React from 'react';
import Material from '../../assets/Material';

export default function EventItem()
{
    return (
        <div>
            <Material.Card>
                <Material.Typography sx={{paddingLeft: '6px', paddingTop: '6px'}}>Status: Pending</Material.Typography>
                
                <Material.CardContent>
                    TX Hash: 0x7722
                </Material.CardContent>

                <Material.CardActions>
                    View in Explorer
                </Material.CardActions>
            </Material.Card>
        </div>
    )
}
