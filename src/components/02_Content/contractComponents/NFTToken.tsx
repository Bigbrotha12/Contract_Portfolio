import React from 'react';
import Material from '../../../assets/Material';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import IController from '../../../app/IController';
import { Action, AppConnectionData } from '../../../app/Definitions';
import { useNFTToken } from '../../../app/ContractHooks';

type TransferTx = {
    recipient: string,
    tokenId: string
}
export default function NFTToken(props: {setConnection: React.Dispatch<Action>, setInfoBanner: React.Dispatch<React.SetStateAction<string>> })
{
    const [transfer, setTransfer] = React.useState<TransferTx>({recipient: '', tokenId: '0'});
    const controller = React.useContext<IController>(ControllerContext);
    const connection = React.useContext<AppConnectionData>(ConnectionContext);
    const [balance, tokens, nftToken, transactions] = useNFTToken(connection.account, connection.network.name, controller);

    React.useEffect(() => {
        props.setConnection({ type: "ADD_TRANSACTION", payload: transactions });
    }, [transactions]);

    return (
        <Material.Card sx={{margin: "12px"}}>
            <Material.CardHeader title="NFT Contract" />
            <Material.CardContent>
                <div>
                    <div className='pb-[12px]'>
                        <Material.Typography sx={{paddingTop: '12px'}}>NFT Token</Material.Typography>
                        <Material.Divider />
                    </div>
                    <div className='flex justify-center'>
                        <Material.Button
                            variant='contained'
                            fullWidth type='button'
                            onClick={() => nftToken.mint(connection.account)}
                        >
                            Mint Token
                        </Material.Button>
                    </div>
                    <Material.Typography sx={{ marginY: '12px' }}>Current NFT Token Balance: {balance}</Material.Typography>
                    <Material.Typography sx={{ marginY: '12px'}}>Transfer NFT</Material.Typography>
                    <Material.TextField
                        sx={{ marginY: '12px' }}
                        onChange={(e) => {
                            if (validateAddress(e.target.value)) {
                                setTransfer((state) => { return { ...state, recipient: e.target.value } });
                            }
                        }}
                        fullWidth
                        label='recipient address'
                    />
                    <Material.TextField
                        sx={{ marginY: '12px' }}
                        onChange={(e) => {
                            if (validateNumber(e.target.value)) {
                                setTransfer((state) => { return { ...state, tokenId: e.target.value }});   
                            }
                        }}
                        fullWidth
                        label='token ID'
                    />
                    <div className='flex justify-center'>
                        <Material.Button
                            fullWidth
                            variant='contained'
                            type='button'
                            onClick={() => nftToken.transfer(transfer.tokenId, transfer.recipient)}
                        >
                            Transfer
                        </Material.Button>
                    </div> 
                </div>
                </Material.CardContent>
        </Material.Card>                
    )
}

function validateAddress(test: string): boolean {
    if (test === undefined) return true;
    return /^$|^0x[a-fA-F0-9]{40}$/.test(test);
}

function validateNumber(test: string): boolean {
    if (test === undefined || test === "") return true;
    let num = parseInt(test);
    if (num !== num) return false;
    return /[0-9]*/.test(test) && num > 0;
}