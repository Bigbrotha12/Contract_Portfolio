import Button from "../Material/Material";
import WalletConnect from "../API/WalletConnect";
import MetamaskConnect from "../API/Metamask";
import Web3Wallet from "../API/Web3Wallet";
import WalletType from "../Constants/Wallets";


export default function Header() {

  const myWallet = new Web3Wallet();

  return (
    <>
      <Button onClick={()=>myWallet.connect(WalletType.METAMASK)}>Connect WC</Button>
      <Button onClick={()=>myWallet.connect(WalletType.METAMASK)}>Connect Meta</Button>
    </>
   
  )
}
