import React from 'react';
import Material from '../../../assets/Material';
import { Network } from '../../00_Common/Definitions';

export default function Selector(props: {title: string, selected: {name: string}, options: Array<Network>, callback: (network: Network) => void})
{ 
    const [selection, setSelection] = React.useState<number>(0);
    const handleSelection = (event) =>
    {
        let index = event.target.value;
        if (index < props.options.length)
        {
            setSelection(index);
            props.callback(props.options[index]);
        }
    }

    return (
        <div>
            <Material.FormControl fullWidth>
                <Material.InputLabel id={props.title}>{props.title}</Material.InputLabel>
                <Material.Select
                    labelId={props.title}
                    value={selection}
                    label={props.title}
                    onChange={handleSelection}
                >
                    {
                        props.options.map((option, index) => {
                            return (
                                <Material.MenuItem key={option.name} value={index}>{option.name}</Material.MenuItem>
                            )
                        })
                    }
                </Material.Select>
            </Material.FormControl>
        </div>
    )
}