import React from 'react';
import { Action, AppConnectionData } from '../../../app/Definitions';
import IController from '../../../app/IController';
import Material from '../../../assets/Material';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import { useTestToken } from '../../../app/ContractHooks';

export default function TestBalance(props: {setConnection: React.Dispatch<Action>})
{
    const [openMenu, setOpenMenu] = React.useState<boolean>(false);
    const [anchor, setAnchor] = React.useState<HTMLElement>();
    const controller = React.useContext<IController>(ControllerContext); 
    const connection = React.useContext<AppConnectionData>(ConnectionContext);
    const [amount, token, transactions, error] = useTestToken(connection.account, connection.network.name, controller);

    React.useEffect(() => {
        props.setConnection({ type: "ADD_TRANSACTION", payload: transactions });
    }, [transactions]);

    return (
        
        <div className='flex my-auto px-[32px]'>
            <Material.ClickAwayListener onClickAway={() => setOpenMenu(false)}>
                <button onClick={(e) => {
                    setAnchor(e.target as HTMLElement);
                    setOpenMenu(true);
                }}>
                    <Material.Chip
                        label={`DEMO Tokens: ${amount}`}
                        variant='outlined'
                    />
                </button>
            </Material.ClickAwayListener>
  
            <Material.Menu anchorEl={anchor} open={openMenu}>
                <Material.MenuItem onClick={() => {
                    token.faucet();
                    setOpenMenu(false);
                }}>Get DEMO Tokens</Material.MenuItem>
                <Material.MenuItem onClick={() => {
                    if (connection.network.faucet) {
                        setOpenMenu(false);
                        window.open(connection.network.faucet, "_blank")?.focus();
                    }
                }}>Get Gas Tokens</Material.MenuItem>
            </Material.Menu>
                
        </div>
    )
}

