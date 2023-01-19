import { Network, Contract, AppConnectionData } from "../components/00_Common/Definitions";

import DemoToken from '../../contracts/artifacts/contracts/A_DemoToken/DemoToken.sol/DemoToken.json';
import Airdrop from '../../contracts/artifacts/contracts/B_Airdrop/AirdropDemo.sol/AirdropDemo.json';
import Bridge from '../../contracts/artifacts/contracts/C_IBC_Messenger/IBC_Bridge.sol/IBC_Bridge.json';
import Flipper from '../../contracts/artifacts/contracts/G_Oracle_Contract/CoinFlipper.sol/CoinFlipper.json';
import Reflect from '../../contracts/artifacts/contracts/D_Reflect_Token/ReflectToken.sol/ReflectToken.json';
import Staker from '../../contracts/artifacts/contracts/E_Staker/Staker.sol/Staker.json';
import NFT from '../../contracts/artifacts/contracts/F_Upgradable_NFT/NFTDemo.sol/NFTDemo.json';

export const Contracts: Array<Contract> =
[
    {
        name: "DemoToken",
        instances:
        [
            {
                network: "Goerli",
                address: ""
            },
            {
                network: "BinanceTest",
                address: ""
            },
            {
                network: "PolygonTest",
                address: ""
            }
        ],
        abi: DemoToken.abi
    },
    {
        name: "Airdrop",
        instances:
        [
            {
                network: "Goerli",
                address: ""
            },
            {
                network: "BinanceTest",
                address: ""
            },
            {
                network: "PolygonTest",
                address: ""
            }
        ],
        abi: Airdrop.abi
    },
    {
        name: "Bridge",
        instances:
        [
            {
                network: "Goerli",
                address: ""
            },
            {
                network: "BinanceTest",
                address: ""
            },
            {
                network: "PolygonTest",
                address: ""
            }
        ],
        abi: Bridge.abi
    },
    {
        name: "Flipper",
        instances:
        [
            {
                network: "Goerli",
                address: ""
            },
            {
                network: "BinanceTest",
                address: ""
            },
            {
                network: "PolygonTest",
                address: ""
            }
        ],
        abi: Flipper.abi
    },
    {
        name: "Reflect",
        instances:
        [
            {
                network: "Goerli",
                address: ""
            },
            {
                network: "BinanceTest",
                address: ""
            },
            {
                network: "PolygonTest",
                address: ""
            }
        ],
        abi: Reflect.abi
    },
    {
        name: "Staker",
        instances:
        [
            {
                network: "Goerli",
                address: ""
            },
            {
                network: "BinanceTest",
                address: ""
            },
            {
                network: "PolygonTest",
                address: ""
            }
        ],
        abi: Staker.abi
    },
    {
        name: "NFT",
        instances:
        [
            {
                network: "Goerli",
                address: ""
            },
            {
                network: "BinanceTest",
                address: ""
            },
            {
                network: "PolygonTest",
                address: ""
            }
        ],
        abi: NFT.abi
    }
]

export const Networks: Array<Network> =
[
    {
        name: "Ethereum",
        id: 1,
        hexID: "0x1",
        explorer: "https://etherscan.io/",
        availableContracts: Contracts,
        rpcUrl: "https://rpc.ankr.com/eth",
        faucet: null
    },
    {
        name: "Goerli",
        id: 5,
        hexID: "0x5",
        explorer: "https://goerli.etherscan.io",
        availableContracts: Contracts,
        rpcUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        faucet: "https://faucetlink.to/goerli"
    },
    {
        name: "Binance",
        id: 56,
        hexID: "0x38",
        explorer: "https://bscscan.com",
        availableContracts: Contracts,
        rpcUrl: "https://bsc-dataseed.binance.org/",
        faucet: null
    },
    {
        name: "BinanceTest",
        id: 97,
        hexID: "0x61",
        explorer: "https://testnet.bscscan.com",
        availableContracts: Contracts,
        rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        faucet: "https://testnet.bnbchain.org/faucet-smart"
    },
    {
        name: "Polygon",
        id: 137,
        hexID: "0x89",
        explorer: "https://explorer.matic.network/",
        availableContracts: Contracts,
        rpcUrl: "https://polygon-rpc.com",
        faucet: null
    },
    {
        name: "PolygonTest",
        id: 80001,
        hexID: "0x13881",
        explorer: "https://mumbai.polygonscan.com/",
        availableContracts: Contracts,
        rpcUrl: "https://rpc-mumbai.maticvigil.com",
        faucet: "https://faucet.polygon.technology/"
    }
]

export const defaultConnection: AppConnectionData = {
    account: '',
    contract: Contracts[0],
    network: Networks[0]
}