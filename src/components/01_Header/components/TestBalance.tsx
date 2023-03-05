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
    const [gasBalance, setGasBalance] = React.useState<string>('0');
    const controller = React.useContext<IController>(ControllerContext); 
    const connection = React.useContext<AppConnectionData>(ConnectionContext);
    const [amount, token, transactions, error] = useTestToken(connection.account, connection.network.name, controller, connection.walletMnemonics);

    React.useEffect(() => {
        props.setConnection({ type: "ADD_TRANSACTION", payload: transactions });
    }, [transactions]);

    React.useEffect(() => {
        (async () => {
            if (!connection.account || !connection.network) { return; }
            let [error, gas] = await controller.GetGasBalance(connection.walletMnemonics, connection.network.name);
            if (!gas) {
                console.error(error);
                return;
            }
            setGasBalance(formatAmount(gas, 4));
            console.log(gas);
        })();
    }, [connection.account, connection.network, connection.transactions]);

    return (
        
        <div className='flex my-auto px-[32px]'>
            <Material.ClickAwayListener onClickAway={() => setOpenMenu(false)}>
                <button
                    className='flex gap-3'
                    onClick={(e) => {
                    setAnchor(e.target as HTMLElement);
                    setOpenMenu(true);
                }}>
                    <Material.Box sx={{border: '1px solid', padding: '6px', minWidth: '160px'}}>
                        <Material.Typography>{`DEMO Tokens: ${amount}`}</Material.Typography>
                    </Material.Box>

                    <div className='hidden lg:block'>
                    <Material.Box sx={{border: '1px solid', padding: '6px', minWidth: '160px'}}>
                        <Material.Typography>{`Gas Tokens: ${gasBalance}`}</Material.Typography>
                    </Material.Box>
                    </div>
                  
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

function formatAmount(amount: string, decimals: number): string
{
    let decimalIndex = amount.indexOf(".");
    if (decimalIndex <= 0) { return amount; }
    
    let desiredLength = decimalIndex + decimals + 1;
    return amount.length > desiredLength ? amount.substring(0, desiredLength) : amount;
}