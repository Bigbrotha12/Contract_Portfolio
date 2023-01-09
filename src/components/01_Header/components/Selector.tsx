import React from 'react';
import Material from '../../../assets/Material';
import { IndexedCallback } from '../../00_Common/Definitions';

export default function Selector(props: {title: string, options: Array<string>, callback: IndexedCallback})
{
    const [selection, setSelection] = React.useState(0);
    
    const handleSelection = (event) =>
    {
        setSelection(event.target.value);
        props.callback(event.target.value);
    }

    return (
        <div className='w-[20%]'>
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
                                <Material.MenuItem key={option} value={index}>{option}</Material.MenuItem>
                            )
                        })
                    }
                </Material.Select>
            </Material.FormControl>
        </div>
    )
}