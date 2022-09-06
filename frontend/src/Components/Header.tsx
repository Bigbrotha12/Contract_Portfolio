import { Button, ButtonGroup, Modal, Box, Typography } from "../Material/Material";
import Web3Wallet from "../API/Web3Wallet";
import { WalletType } from "../Constants/Web3Types";
import { SetStateAction } from "react";
import Navbar from "./Navbar";
import Title from "./Title";
import style from "../styling.module.css";
import React from "react";
import MetaIcon from "../Icons/metamask-fox.svg";
import WCIcon from "../Icons/walletconnect.svg";

interface HeaderProps {
  walletState: {},
  walletSetting: React.Dispatch<SetStateAction<{}>>
}

export default function Header(props: HeaderProps) {
  const [modalOpen, setModalOpen] = React.useState(false);

  async function connectWeb3(type: WalletType) {
    let wallets = new Web3Wallet();
    await wallets.connect(type);
    props.walletSetting(wallets);
    setModalOpen(false);
  }

  return (
    <div
      className={style.header}
    >
      <Title />
      <Navbar />
      <div className={style.login}>
        <Button variant="outlined" onClick={()=>setModalOpen(true)}>Sign In</Button>
      </div>
     
      <Modal open={modalOpen} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box className={style.modalBox}>
          <Typography variant="h6" className={style.modalTitle} id="modal-title">Select Wallet to Connect</Typography>
          <div className={style.modalDesc} id="modal-description">
            <ButtonGroup variant="text" className={style.modalGroupButton}>
              <Button className={style.buttonWC} onClick={()=>connectWeb3(WalletType.WALLETCONNECT)}>
                WalletConnect
                <img className={style.modalIcon} src={WCIcon} alt="Metamask"/>
              </Button>
              <Button className={style.buttonMT} onClick={()=>connectWeb3(WalletType.METAMASK)}>
                Metamask
                <img className={style.modalIcon} src={MetaIcon} alt="Metamask"/>
              </Button>
            </ButtonGroup>
             </div> 
          <div className={style.buttonCancel}>
          <Button variant="outlined" onClick={()=>setModalOpen(false)}>Cancel</Button>
          </div>
         
        </Box>
      </Modal>
      
    </div>
   
  )
}
