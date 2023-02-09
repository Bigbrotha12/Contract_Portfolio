import React from 'react';
import Material from '../../../assets/Material';
import { Action, AppConnectionData, Contract, ContractName } from '../../../app/Definitions';
import { ConnectionContext } from '../../../state/AppContext';
import { Contracts } from '../../../app/Networks';

export default function ContractSelector(props: {title: string, setConnection: React.Dispatch<Action>})
{ 
    const connection = React.useContext<AppConnectionData>(ConnectionContext);
    
    return (
        <div className='w-[20%]'>
            <Material.FormControl fullWidth>
                <Material.InputLabel id={props.title}>{props.title}</Material.InputLabel>
                <Material.Select
                    labelId={props.title}
                    value={connection.contract.name}
                    label={props.title}
                    onChange={(e) => {
                        if (validateName(e.target.value)) {
                            props.setConnection({type: "CONTRACT_CHANGE", payload: Contracts.get(e.target.value)!})
                        }
                    }}
                >
                {
                    Array.from(Contracts.keys()).filter((name) => name !== "Token").map((name) => {
                        return (<Material.MenuItem key={name} value={name}>{name}</Material.MenuItem>)
                    })
                }
                </Material.Select>
            </Material.FormControl>
        </div>
    )
}

function validateName(test: string): test is ContractName {
    return Contracts.get(test as ContractName) !== undefined;
}