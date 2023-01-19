import React from 'react';
import Material from '../../../assets/Material';
import { AppConnectionData } from '../../00_Common/Definitions';
import { ConnectionContext, ControllerContext } from '../../../state/AppContext';
import IController from '../../../app/IController';

export default function NFTToken()
{
    const [recipient, setRecipient] = React.useState<string>("");
    const [tokenId, setTokenId] = React.useState<string>("");
    const controller = React.useContext<IController>(ControllerContext);
    const connection: AppConnectionData = React.useContext(ConnectionContext);

    function mintToken()
    {
        if (connection.account) {
            controller.NFTMint(connection.account);
        }
    }
    function transfer()
    {
        if (recipient && tokenId) {
            controller.NFTTransfer(recipient, parseInt(tokenId));
        }
    }
    
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
                        <Material.Button variant='contained' fullWidth type='button' onClick={mintToken}>Mint Token</Material.Button>
                    </div>
                    <Material.Typography sx={{ marginY: '12px' }}>Current NFT Token Balance</Material.Typography>
                    <Material.Typography sx={{ marginY: '12px'}}>Transfer NFT</Material.Typography>
                    <Material.TextField
                        sx={{ marginY: '12px' }}
                        onChange={(e) => {
                            if (validateAddress(e.target.value)) {
                                setRecipient(e.target.value)
                            }
                        }}
                        fullWidth
                        label='recipient address'
                    />
                    <Material.TextField
                        sx={{ marginY: '12px' }}
                        onChange={(e) => {
                            if (validateNumber(e.target.value)) {
                                setTokenId(e.target.value)
                            }
                        }}
                        fullWidth
                        label='token ID'
                    />
                    <div className='flex justify-center'>
                        <Material.Button variant='contained' type='button' onClick={transfer}>Transfer</Material.Button>
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