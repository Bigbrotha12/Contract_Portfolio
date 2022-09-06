import MetamaskConnect from "./Metamask";
import WalletConnect from "./WalletConnect";
import { WalletType } from "../Constants/Web3Types";

export default class Web3Wallet {
    constructor() {
      this.isConnected = false;
    }

    walletType!: WalletType;
    provider!: any;
    isConnected: boolean;
    account!: string;
    chainId!: number;
  
    async connect(wallet: WalletType) {
        switch (wallet) {
            case WalletType.METAMASK:
                this.provider = await MetamaskConnect();
                if(this.provider) {
                    this.walletType = WalletType.METAMASK;
                    this.isConnected = true;
                    this.account = (this.provider as any).selectedAddress;
                    this.chainId = parseInt((this.provider as any).chainId, 16);
                } else {
                    console.error("MT: Connection Error");
                }
                break;
            case WalletType.WALLETCONNECT:
                this.provider = await WalletConnect();
                if(this.provider) {
                    this.walletType = WalletType.WALLETCONNECT;
                    this.isConnected = true;
                    this.account = (this.provider as any).accounts[0];
                    this.chainId = (this.provider as any).chainId;
                } else {
                    console.log(this.provider);
                }
                break;
            default:
                console.error("Unsupported Wallet Type");
        }
    }
    changeAccount() {
        if(this.isConnected){

        } else {
            console.error("You must be connected to provider");
        }
    }
    changeChain() {
        if(this.isConnected){

        } else {
            console.error("You must be connected to provider");
        }
    }
    disconnect() {
        if(this.isConnected){

        } else {
            console.error("You must be connected to provider");
        }
    }
  }
  