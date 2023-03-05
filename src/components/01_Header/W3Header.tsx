import React, { Fragment } from 'react';
import { Action, AppConnectionData } from '../../app/Definitions';
import { ConnectionContext } from '../../state/AppContext';

import APIStatus from './components/APIStatus';
import Connector from './components/Connector';
import TestBalance from './components/TestBalance';
import Account from './components/Account';
import ContractSelector from './components/ContractSelector';
import NetworkSelector from './components/NetworkSelector';
import Material from '../../assets/Material';

export default function W3Header(props: {setConnection: React.Dispatch<Action>})
{
    return (
        <Fragment>
            <div className='block md:hidden'><ShortHeader {...props}/></div>
            <div className='hidden md:block'><FullHeader {...props} /></div>
        </Fragment>
    )
}

function FullHeader(props: {setConnection: React.Dispatch<Action>}): JSX.Element {
    const connection = React.useContext<AppConnectionData>(ConnectionContext);

    return (
        <div className='bg-white flex p-3 shadow-md'>
            <APIStatus connected={connection.account !== ''} />
            <ContractSelector title='Contract' setConnection={props.setConnection} />
            <div className='m-auto' />
            <TestBalance setConnection={props.setConnection} />
            <NetworkSelector title='Network' setConnection={props.setConnection} />
            {
                connection.account !== '' ? <Account setConnection={props.setConnection} /> : <Connector setConnection={props.setConnection} />
            }
        </div>
    )
}

function ShortHeader(props: {setConnection: React.Dispatch<Action>}): JSX.Element {
    const [openMenu, setOpenMenu] = React.useState<boolean>(false);

    const connection = React.useContext<AppConnectionData>(ConnectionContext);

    return (
        <div className='bg-white flex py-[12px] shadow-md'>
            <Fragment>
                <Material.Button
                sx={{marginLeft: '12px'}}
                variant='text'
                startIcon={<Material.MoreVertIcon />}
                onClick={(event) => setOpenMenu(true)}
                >
                    Blockchain
                </Material.Button>
            

                <Material.Drawer
                    anchor={'left'}
                    open={openMenu}
                >
                    <Material.List>
                        <Material.ListItem><Material.Button onClick={() => setOpenMenu(false)} variant='outlined'>Close</Material.Button></Material.ListItem>
                        <Material.ListItem><TestBalance setConnection={props.setConnection} /></Material.ListItem>
                        <Material.ListItem><NetworkSelector title='Network' setConnection={props.setConnection} /></Material.ListItem>
                        <Material.ListItem><ContractSelector title='Contract' setConnection={props.setConnection} /></Material.ListItem>
                    </Material.List>
                </Material.Drawer>
            </Fragment>
          
            <div className='ml-auto'>
            {
                connection.account !== '' ? <Account setConnection={props.setConnection} /> : <Connector setConnection={props.setConnection} />
            }
            </div>
        </div>
    )
}
