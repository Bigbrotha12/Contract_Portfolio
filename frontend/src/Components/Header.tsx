import Button from "../Material/Material";
import Web3Wallet from "../API/Web3Wallet";
import contractInterface from "../Utils/ContractInterface";
import { WalletType, ContractInstance } from "../Constants/Web3Enums";
import React from "react";
import Navbar from "./Navbar";
import Title from "./Title";
import style from "./styling.module.css";

export default function Header() {
  const [wallet, setWallet] = React.useState({});

  async function connectWeb3(type: WalletType) {
    let wallets = new Web3Wallet();
    await wallets.connect(type);
    setWallet(wallets);
  }

  return (
    <div
      className={style.header}
    >
      <Title />
      <Navbar />
      <div>
        <Button onClick={()=>connectWeb3(WalletType.WALLETCONNECT)}>Connect WC</Button>
        <Button onClick={()=>connectWeb3(WalletType.METAMASK)}>Connect Meta</Button>
      </div>
      
    </div>
   
  )
}
