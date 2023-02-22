import React, { Fragment } from 'react';
import { Action, AppConnectionData } from '../../../app/Definitions';
import Material from '../../../assets/Material';
import { ConnectionContext } from '../../../state/AppContext';

export default function Account(props: {setConnection: React.Dispatch<Action>})
{
    const [openMenu, setOpenMenu] = React.useState<boolean>(false);
    const [anchor, setAnchor] = React.useState<HTMLElement>();
    const connection = React.useContext<AppConnectionData>(ConnectionContext);

    function handleMenu(event) {
        setAnchor(event.target);
        setOpenMenu(true);
    }

    function copyAddress() {
        navigator.clipboard.writeText(connection.account);
        setOpenMenu(false);
    }

    function disconnect() {
        props.setConnection({ type: "DISCONNECT_ACCOUNT", payload: null });
        setOpenMenu(false);
    }

    return (
        
        <div className='flex align-middle px-[32px]'>
            <Material.ClickAwayListener onClickAway={() => setOpenMenu(false)}>
                <Material.Button onClick={handleMenu}>
                    <Material.Chip
                        label={shortAddress(connection.account)}
                        variant='outlined' />
                </Material.Button>
            </Material.ClickAwayListener>

            <Material.Menu
                anchorEl={anchor}
                open={openMenu}
            >
                <Material.MenuItem onClick={copyAddress}>Copy Address</Material.MenuItem>
                <Material.MenuItem onClick={disconnect}>Disconnect</Material.MenuItem>
            </Material.Menu>
        </div>
        
    )
}

function shortAddress(address: string)
{
    return address.length > 10 ? address.substring(0, 6) + "..." +  address.substring(address.length - 5) : address;
}