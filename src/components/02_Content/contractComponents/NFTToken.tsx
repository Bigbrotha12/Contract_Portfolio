import React from 'react';
import Material from '../../../assets/Material';
import { ControllerContext } from '../../../state/AppContext';
import IController from '../../../app/IController';
import { Contracts } from '../../../app/Networks';

type TransferTx = {
    recipient: string,
    tokenId: number
}
export default function NFTToken()
{
    const [userBalance, setUserBalance] = React.useState<number>(0);
    const [transfer, setTransfer] = React.useState<TransferTx>({recipient: '', tokenId: 0});
    const controller = React.useContext<IController>(ControllerContext);

    function mintToken() {
        if (controller.ConnectionStatus()) {
            controller.NFTMint();
        }
    }
    function sendTransfer() {
        if (transfer.recipient && transfer.tokenId) {
            controller.NFTTransfer(transfer.recipient, transfer.tokenId);
        }
    }
    async function updateUserBalance(event) {
        console.log(event);
    }

    React.useEffect(() => {
        if (controller.ConnectionStatus()) {
            setUserBalance(controller.NFTBalance());
        }
        controller.Subscribe(Contracts.get("NFT")!, "Transfer", updateUserBalance);
        return (() => controller.Unsubscribe(Contracts.get("NFT")!, "Transfer", updateUserBalance));
    }, [])
    
    
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
                    <Material.Typography sx={{ marginY: '12px' }}>Current NFT Token Balance: {userBalance}</Material.Typography>
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
                                setTransfer((state) => { return { ...state, tokenId: parseInt(e.target.value) }});   
                            }
                        }}
                        fullWidth
                        label='token ID'
                    />
                    <div className='flex justify-center'>
                        <Material.Button fullWidth variant='contained' type='button' onClick={sendTransfer}>Transfer</Material.Button>
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