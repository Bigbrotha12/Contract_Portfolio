import { useState, useEffect, useMemo } from "react";
import Address from "./Address/Address";
import { useMoralis } from "react-moralis";
import Blockie from "./Blockie";
import contractInfo from "../contracts/Staking.json";
import { abi as tokenAbi } from "../contracts/StakeToken.json";
import { Button, Card, Form, Input } from "antd";
import Text from "antd/lib/typography/Text";
import AnimatedNumber from "animated-number-react";
import coins from '../pictures/coins.jpeg';

const styles = {
  title: {
    fontSize: "30px",
    fontWeight: "600",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
  },
  card: {
    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "1rem",
    width: "450px",
    fontSize: "16px",
    fontWeight: "500",
  },
  sideCard: {
    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "1rem",
    marginLeft: "10px",
    width: "250px",
    fontSize: "16px",
    fontWeight: "500",
  },
};

const Main = (props) => {
  const { Moralis, isAuthenticated, chainId } = useMoralis();
  const [ amount, setAmount ] = useState(0);
  const [ apy, setApy ] = useState(0);
  const [ totalSupply, setTotalSupply ] = useState(0);
  const [ unclaimedReward, setUnclaimedReward ] = useState(0);
  const [ tokenBalance, setTokenBalance ] = useState(0);
  const [ tokenSupply, setTokenSupply ] = useState(0);
  const [ poolShare, setPoolShare ] = useState(0);
  const [ funds, setFunds ] = useState(0);
  const [ reward, setReward ] = useState(0);
  const [ period, setPeriod ] = useState(0);
  const [ mintAmount, setMintAmount ] = useState(0);
  const { abi, networks } = contractInfo;
  const LPToken = [
    {
      tokenName: "Nomel",
      address: "0xE033c95e532e4de00E5f97F8B1F5f7f025400F7b",
      LPshare: 1,
      tokenPrice: 1
    },
    {
      tokenName: "BNB",
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      LPshare: 1,
      tokenPrice: 1
    }
  ];
  const rewardCoinAddress = "0xfD0934Db8Cb5153b401E227A40eB5ddAE2279253";
  const stakeCoinAddress = "0xfD0934Db8Cb5153b401E227A40eB5ddAE2279253";
  const stakeContractAddress = networks["3"].address;

  const stake = async (amount) => {
    let web3 = await Moralis.enableWeb3();
    let contract = new web3.eth.Contract(abi, stakeContractAddress);
    let stakeCoin = new web3.eth.Contract(tokenAbi, stakeCoinAddress);
    let account = await web3.eth.getAccounts();

    let weiAmount = web3.utils.toWei(amount.toString());
    stakeCoin.methods.approve(stakeContractAddress, weiAmount).send({from: account[0]})
    .on('receipt', () => {
      contract.methods.stake(weiAmount).send({from: account[0]});
    });
    
  };

  const withdraw = async (amount) => {
    let web3 = await Moralis.enableWeb3();
    let contract = new web3.eth.Contract(abi, stakeContractAddress);
    let account = await web3.eth.getAccounts();

    let weiAmount = web3.utils.toWei(amount.toString());
    contract.methods.withdraw(weiAmount).send({from: account[0]});
    
  };

  const approve = async () => {
    let web3 = await Moralis.enableWeb3();
    let rewardCoin = new web3.eth.Contract(tokenAbi, rewardCoinAddress);
    let account = await web3.eth.getAccounts();

    // Unlimited approval
    let max_uint256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
    rewardCoin.methods.approve(stakeContractAddress, max_uint256).send({from: account[0]});
    
  };

  const addFunds = async (amount) => {
    let web3 = await Moralis.enableWeb3();
    let contract = new web3.eth.Contract(abi, stakeContractAddress);
    let account = await web3.eth.getAccounts();

    let weiAmount = web3.utils.toWei(amount.toString());
    contract.methods.addFunding(weiAmount).send({from: account[0]});
    
  };

  const activateReward = async (amount, period) => {
    let web3 = await Moralis.enableWeb3();
    let contract = new web3.eth.Contract(abi, stakeContractAddress);
    let account = await web3.eth.getAccounts();

    // Period provided in days. 1-day = 86400 / 3 = 28,800 blocks
    let weiAmount = web3.utils.toWei(amount.toString());
    let blockPeriod = 28800 * period;
    contract.methods.activateReward(weiAmount, blockPeriod).send({from: account[0]});
    
  };

  const mintToken = async (amount) => {
    let web3 = await Moralis.enableWeb3();
    let stakeCoin = new web3.eth.Contract(tokenAbi, stakeCoinAddress);
    let account = await web3.eth.getAccounts();

    let weiAmount = web3.utils.toWei(amount.toString());
    stakeCoin.methods.mint(weiAmount).send({from: account[0]});

  };

  const formatNumber = (value) => Number(value).toLocaleString();
  const formatPct = (value) => Number(value).toLocaleString('en-US', {style: 'percent'});
  const calcROI = (rewardRate, LPool, stakeSize) => {
    // Calculate 1-week ROI. 1-week == 86400 * 7 / 3 = 201,600 blocks
    const weekBlocks = 201600;
    const weeklyEmission = weekBlocks * rewardRate;
    const weeklyReward = LPool[0].tokenPrice * weeklyEmission;
    const LPTokenPrice = LPool[0].LPshare * LPool[0].tokenPrice + LPool[1].LPshare * LPool[1].tokenPrice;
    let size = stakeSize === 0 ? 1 : stakeSize;
    const share = 1 / size;
    return weeklyReward * share / LPTokenPrice;
  };

  useEffect(() => {
    const updater = setInterval(async () => {
      let web3 = await Moralis.enableWeb3();
      let contract = new web3.eth.Contract(abi, stakeContractAddress);
      let stakeCoin = new web3.eth.Contract(tokenAbi, stakeCoinAddress);
      let account = await web3.eth.getAccounts();

      let weiSupply = await contract.methods.totalSupply().call();
      let weiBalance = await contract.methods.balanceOf(account[0]).call();
      let weiReward = await contract.methods.earned(account[0]).call();
      let weiRate = await contract.methods._blockReward().call();
      let weiTokenBal = await stakeCoin.methods.balanceOf(account[0]).call();
      let weiTokenSup = await stakeCoin.methods.totalSupply().call();

      setTotalSupply(web3.utils.fromWei(weiSupply.toString()));
      setPoolShare(web3.utils.fromWei(weiBalance.toString()) / web3.utils.fromWei(weiSupply.toString()));
      setUnclaimedReward(web3.utils.fromWei(weiReward.toString()));
      setTokenBalance(web3.utils.fromWei(weiTokenBal.toString()));
      setTokenSupply(web3.utils.fromWei(weiTokenSup.toString()));
      setApy(calcROI(web3.utils.fromWei(weiRate.toString()), LPToken, web3.utils.fromWei(weiSupply.toString())));
    }, 5000);
    return () => clearInterval(updater);
  }, []);

  return (
    <>
      <Card
        style={styles.card}
        title={
          <div style={styles.header}>
            <Blockie scale={5} avatar currentWallet style />
            <Address size="6" copyable />
          </div>
        }
      >
        <Form.Item style={{ marginBottom: "5px" }}>
          <div style={{ display: "flex" }}>
            <img src={coins} width='25px' height='25px' alt='coin_pair' />
            <Text style={{ marginLeft: "10px"}}>TestNOMEL</Text>
          </div>
          <div style={{ display: "flex" }}>
            Total Staked:
            <Text style={{ marginLeft: "auto" }}>
              <AnimatedNumber
              value={totalSupply}
              formatValue={formatNumber}
              />
            </Text>
          </div>
          <div style={{ display: "flex" }}>
            1-week ROI:
            <Text style={{ marginLeft: "auto" }}>
              <AnimatedNumber
              value={apy}
              formatValue={formatPct}
              />
            </Text>
          </div>

          <hr/>
          <div style={{ display: "flex" }}>
            Pool Share:
            <Text style={{ marginLeft: "auto"}}>
              <AnimatedNumber
              value={poolShare}
              formatValue={formatPct}
              />
            </Text>
          </div>
          <div style={{ display: "flex" }}>
            Unclaimed Rewards:
            <Text style={{ marginLeft: "auto" }}>
              <AnimatedNumber
              value={unclaimedReward}
              formatValue={formatNumber}
              />
            </Text>
          </div>
          <div style={{ display: "flex", margin: "10px", alignItems: 'center'}}>
            <Input placeholder='Amount'onChange={e => setAmount(e.target.value)}/>
          </div>
          <div style={{ display: "flex", margin: "10px", align: 'center' }}>
            <Button style={{ margin: "auto", width: '100%'}} type='primary' onClick={() => stake(amount)}>STAKE</Button>
          </div>
          <div style={{ display: "flex", margin: "10px", align: 'center' }}>
            <Button style={{ margin: "auto", width: '100%'}} type='primary' onClick={() => withdraw(amount)}>WITHDRAW</Button>
          </div>

          <hr />
          <p>Admin Options</p>
          <div style={{ display: "flex", margin: "10px", align: 'center' }}>
            <Button style={{ margin: "auto", width: '100%'}} type='primary' onClick={() => approve()}>APPROVE REWARD TOKEN</Button>
          </div>
          <div style={{ display: "flex", margin: "10px", alignItems: 'center'}}>
            <Input placeholder='Amount'onChange={e => setFunds(e.target.value)}/>
          </div>
          <div style={{ display: "flex", margin: "10px", align: 'center' }}>
            <Button style={{ margin: "auto", width: '100%'}} type='primary' onClick={() => addFunds(funds)}>ADD FUNDS</Button>
          </div>
          <div style={{ display: "flex", margin: "10px", alignItems: 'center'}}>
            <Input placeholder='Amount'onChange={e => setReward(e.target.value)}/>
          </div>
          <div style={{ display: "flex", margin: "10px", alignItems: 'center'}}>
            <Input placeholder='Days'onChange={e => setPeriod(e.target.value)}/>
          </div>
          <div style={{ display: "flex", margin: "10px", align: 'center' }}>
            <Button style={{ margin: "auto", width: '100%'}} type='primary' onClick={() => activateReward(reward, period)}>ACTIVATE REWARD</Button>
          </div>
        </Form.Item>
      </Card>
      <Card
        style={styles.sideCard}
        title="TestNOMEL Interface"
      >
        <div style={{ display: "flex" }}>
            Current Balance:
            <Text style={{ marginLeft: "auto" }}>
              <AnimatedNumber
              value={tokenBalance}
              formatValue={formatNumber}
              />
            </Text>
          </div>
          <div style={{ display: "flex" }}>
            Total Supply:
            <Text style={{ marginLeft: "auto" }}>
              <AnimatedNumber
              value={tokenSupply}
              formatValue={formatNumber}
              />
            </Text>
        </div>
        <hr />
        <div style={{ display: "flex", margin: "10px", alignItems: 'center'}}>
          <Input placeholder='Mint Amount' onChange={e => setMintAmount(e.target.value)}/>
        </div>
        <div style={{ display: "flex", margin: "10px", align: 'center' }}>
          <Button style={{ margin: "auto", width: '100%'}} type='primary' onClick={() => mintToken(mintAmount)}>MINT TOKEN</Button>
        </div>
      </Card>
    </>
  )
}

export default Main
