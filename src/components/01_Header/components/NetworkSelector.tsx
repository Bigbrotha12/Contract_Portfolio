import React, { Fragment } from 'react';
import Material from '../../../assets/Material';
import { Action, AppConnectionData, Network, NetworkName } from '../../../app/Definitions';
import { Networks } from '../../../app/Networks';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import IController from '../../../app/IController';

export default function Selector(props: {title: string, setConnection: React.Dispatch<Action>})
{ 
    const controller = React.useContext<IController>(ControllerContext); 
    const connection = React.useContext<AppConnectionData>(ConnectionContext);

    const handleSelection = async (event) =>
    {
        let chain = Networks.get(event.target.value);
        if (chain)
        {
            let network = await controller.ChangeNetwork(chain, connection.walletMnemonics);
            props.setConnection({ type: "NETWORK_CHANGE", payload: chain });
        }
    }

    return (
        <Fragment>
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
                                <Material.MenuItem key={name} value={name} hidden={name === 'Not Connected'}>
                                    <div className='flex'>
                                        <img className='mr-[6px] w-[2rem] h-[2rem]' src={Networks.get(name)?.icon} />
                                        <div className='my-auto align-middle'>{name}</div>
                                    </div>
                                </Material.MenuItem>)
                        })
                    }
                </Material.Select>
            </Material.FormControl>
        </Fragment>
    )
}

function NetworkOptions(props: { options: Map<NetworkName, Network>}): JSX.Element {
    let available: Array<JSX.Element> = [];
    props.options.forEach((value, key) => {
        available.push(<Material.MenuItem key={value.id} value={key}>{value.name}</Material.MenuItem>);
    })
    return (
        <Fragment>
            {available.map(value => {return value})}
        </Fragment>
    )
}