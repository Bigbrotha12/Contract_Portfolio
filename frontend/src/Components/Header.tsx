import Button from "../Material/Material";
import connectWallet from "../API/WalletConnect";

export default function Header() {
  return (
    <Button onClick={()=>connectWallet()}>Connect</Button>
  )
}
