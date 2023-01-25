import { Network, Contract, AppConnectionData, ContractName } from "./Definitions";

import DemoToken from '../../contracts/artifacts/contracts/A_DemoToken/DemoToken.sol/DemoToken.json';
import Airdrop from '../../contracts/artifacts/contracts/B_Airdrop/AirdropDemo.sol/AirdropDemo.json';
import Bridge from '../../contracts/artifacts/contracts/C_IBC_Messenger/IBC_Bridge.sol/IBC_Bridge.json';
import Flipper from '../../contracts/artifacts/contracts/G_Oracle_Contract/CoinFlipper.sol/CoinFlipper.json';
import Reflect from '../../contracts/artifacts/contracts/D_Reflect_Token/ReflectToken.sol/ReflectToken.json';
import Staker from '../../contracts/artifacts/contracts/E_Staker/Staker.sol/Staker.json';
import NFT from '../../contracts/artifacts/contracts/F_Upgradable_NFT/NFTDemo.sol/NFTDemo.json';

export const Contracts: Map<string, Contract> = new Map<ContractName, Contract>([
    ["Airdrop", {
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
    }],
    ["Bridge", {
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
    }],
    ["Flipper", {
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
    }],
    ["Reflect", {
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
    }],
    ["Staker", {
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
    }],
    ["NFT", {
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
    }]
]);

export const Networks: Array<Network> =
[
    {
        name: "Ethereum",
        id: 1,
        hexID: "0x1",
        explorer: "https://etherscan.io/",
        rpcUrl: "https://rpc.ankr.com/eth",
        faucet: null
    },
    {
        name: "Goerli",
        id: 5,
        hexID: "0x5",
        explorer: "https://goerli.etherscan.io",
        rpcUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        faucet: "https://faucetlink.to/goerli"
    },
    {
        name: "Binance",
        id: 56,
        hexID: "0x38",
        explorer: "https://bscscan.com",
        rpcUrl: "https://bsc-dataseed.binance.org/",
        faucet: null
    },
    {
        name: "BinanceTest",
        id: 97,
        hexID: "0x61",
        explorer: "https://testnet.bscscan.com",
        rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        faucet: "https://testnet.bnbchain.org/faucet-smart"
    },
    {
        name: "Polygon",
        id: 137,
        hexID: "0x89",
        explorer: "https://explorer.matic.network/",
        rpcUrl: "https://polygon-rpc.com",
        faucet: null
    },
    {
        name: "PolygonTest",
        id: 80001,
        hexID: "0x13881",
        explorer: "https://mumbai.polygonscan.com/",
        rpcUrl: "https://rpc-mumbai.maticvigil.com",
        faucet: "https://faucet.polygon.technology/"
    }
]

export const defaultConnection: AppConnectionData = {
    account: '',
    contract: Contracts.get("Airdrop")!,
    network: Networks[0]
}