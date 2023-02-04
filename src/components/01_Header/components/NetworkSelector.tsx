import React from 'react';
import Material from '../../../assets/Material';
import { AppConnectionData, Network, NetworkName } from '../../../app/Definitions';
import { Networks } from '../../../app/Networks';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import IController from '../../../app/IController';

export default function Selector(props: {title: string, setConnection: React.Dispatch<React.SetStateAction<AppConnectionData>>})
{ 
    const controller = React.useContext<IController>(ControllerContext); 
    const connection = React.useContext<AppConnectionData>(ConnectionContext);

    const handleSelection = async (event) =>
    {
        let chain = Networks.get(event.target.value);
        console.log(chain);
        if (chain && await controller.ChangeNetwork(chain))
        {
            props.setConnection({ ...connection, network: chain });
        }
    }

    return (
        <div className='w-[20%]'>
            <Material.FormControl fullWidth>
                <Material.InputLabel id={props.title}>{props.title}</Material.InputLabel>
                <Material.Select
                    labelId={props.title}
                    value={connection.network.name}
                    label={props.title}
                    onChange={handleSelection}
                >
                    {
                        Array.from(Networks.keys()).map((name) => {
                            return (
                                <Material.MenuItem key={name} value={name}>
                                    <div className='flex'>
                                        <img className='mr-[6px]' width='32rem' height='32rem' src={Networks.get(name)?.icon} />
                                        <div className='my-auto align-middle'>{name}</div>
                                    </div>
                                </Material.MenuItem>)
                        })
                    }
                </Material.Select>
            </Material.FormControl>
        </div>
    )
}

function NetworkOptions(props: { options: Map<NetworkName, Network>}): JSX.Element {
    let available: Array<JSX.Element> = [];
    props.options.forEach((value, key) => {
        available.push(<Material.MenuItem key={value.id} value={key}>{value.name}</Material.MenuItem>);
    })
    return (
        <>
            {available.map(value => {return value})}
        </>
    )
}