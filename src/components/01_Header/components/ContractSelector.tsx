import React from 'react';
import Material from '../../../assets/Material';
import { Contract, ContractName } from '../../../app/Definitions';

export default function ContractSelector(props: {title: string, selected: Contract, options: Map<string, Contract>, callback: (contract: ContractName) => void})
{ 
    return (
        <div className='w-[20%]'>
            <Material.FormControl fullWidth>
                <Material.InputLabel id={props.title}>{props.title}</Material.InputLabel>
                <Material.Select
                    labelId={props.title}
                    value={props.selected.name}
                    label={props.title}
                    onChange={(e) => {
                        if (validateName(e.target.value)) {
                            props.callback(e.target.value)
                        }
                    }}
                >
                {
                    Array.from(props.options.keys()).map((name) => {
                        return (<Material.MenuItem key={name} value={name}>{name}</Material.MenuItem>)
                    })
                }
                </Material.Select>
            </Material.FormControl>
        </div>
    )
}

function validateName(test: string): test is ContractName {
    switch (test) {
        case "Airdrop":
            return true;
        case "NFT":
            return true;
        case "Bridge":
            return true;
        case "Flipper":
            return true;
        case "Reflect":
            return true;
        case "Staker":
            return true;
        case "Token":
            return true;
        default:
            return false;
    }
}