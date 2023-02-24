import { Network, Contract, AppConnectionData, ContractName, NetworkName, Web3Transaction } from "./Definitions";

import DemoToken from '../../contracts/artifacts/contracts/A_DemoToken/DemoToken.sol/DemoToken.json';
import Airdrop from '../../contracts/artifacts/contracts/B_Airdrop/AirdropDemo.sol/AirdropDemo.json';
import Bridge from '../../contracts/artifacts/contracts/C_IBC_Messenger/IBC_Bridge.sol/IBC_Bridge.json';
import Flipper from '../../contracts/artifacts/contracts/G_Oracle_Contract/CoinFlipper.sol/CoinFlipper.json';
import Reflect from '../../contracts/artifacts/contracts/D_Reflect_Token/ReflectToken.sol/ReflectToken.json';
import Staker from '../../contracts/artifacts/contracts/E_Staker/Staker.sol/Staker.json';
import NFT from '../../contracts/artifacts/contracts/F_Upgradable_NFT/NFTDemo.sol/NFTDemo.json';
import NFTLogic from '../../contracts/artifacts/contracts/F_Upgradable_NFT/FamiliarLogic.sol/FamiliarLogic.json';

//Icons
import SolidityIcon from '../assets/icons/solidity.png';
import EthereumIcon from '../assets/icons/EthereumMain-icon.png';
import GoerliIcon from '../assets/icons/EthereumTest-icon.png';
import BNBMainIcon from '../assets/icons/BnbMain-icon.png';
import BNBTestIcon from '../assets/icons/BnbTest-icon.png';
import PolygonMainIcon from '../assets/icons/PolygonMain-icon.png';
import PolygonTestIcon from '../assets/icons/PolygonTest-icon.png';

export const Contracts: Map<ContractName, Contract> = new Map<ContractName, Contract>([
    ["Token", {
        name: "Token",
        instances:
            [
                {
                    network: "Goerli",
                    address: "0xbb8e8e55a3b9247f46f96b61c5c51f7b2fb21495"
                },
                {
                    network: "BNB Chain Testnet",
                    address: "0xfB1686D1993508019BbFef53c5065009874cd1a9"
                },
                {
                    network: "Polygon Mumbai",
                    address: "0xBb91f367dD50cF80f55EF836c7A46E8dc0D79f55"
                }
            ],
        abi: DemoToken.abi
    }],
    ["Airdrop", {
        name: "Airdrop",
        instances:
            [
                {
                    network: "Goerli",
                    address: "0x8e6e0f41a6582e73bf3d5844d444ceb6232fcc9b"
                },
                {
                    network: "BNB Chain Testnet",
                    address: "0x6c755f9644E0ABa078450211aA1320bCbE2647AF"
                },
                {
                    network: "Polygon Mumbai",
                    address: "0xfB1686D1993508019BbFef53c5065009874cd1a9"
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
                address: "0x28408975393ba195305ebe5f5936ce749da67b4a"
            },
            {
                network: "BNB Chain Testnet",
                address: "0xB7Eaa855Fa6432D0597F297BaCE4613c33a075d1"
            },
            {
                network: "Polygon Mumbai",
                address: "0x2EF8390d0ED43fD98B785AE414Bb5dd5364d621B"
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
                address: "0x264847ac7de3b943c8f9baa050416d6b6211dc03"
            },
            {
                network: "BNB Chain Testnet",
                address: "0xBb8E8e55a3B9247F46f96B61C5c51f7B2fB21495"
            },
            {
                network: "Polygon Mumbai",
                address: "0x036D097BB3C11DD3a0F6e22fbe521d6b48dc1FBc"
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
                address: "0xd4d1d0238186bed528351851a413a02d7c7c1482"
            },
            {
                network: "BNB Chain Testnet",
                address: "0x53709dAB3d6d7e64C6BC4d539e6c74E07BA2c711"
            },
            {
                network: "Polygon Mumbai",
                address: "0x28408975393Ba195305EBe5f5936Ce749da67B4A"
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
                address: "0x6569f311501132ccc5503d043dc676f55d1bcda8"
            },
            {
                network: "BNB Chain Testnet",
                address: "0xf7EC61fA7fd5250d7913D330d0Ae57B5594D0f40"
            },
            {
                network: "Polygon Mumbai",
                address: "0x264847AC7de3b943C8f9BAA050416d6b6211DC03"
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
                address: "0x23b8b7c013a43692ea40c5ced1a2f2aa1afc21f6"
            },
            {
                network: "BNB Chain Testnet",
                address: "0xd4d1D0238186bED528351851A413a02d7c7c1482"
            },
            {
                network: "Polygon Mumbai",
                address: "0x609E32A30D6F758a2D3513E85B8C6aA5A791Dffb"
            }
        ],
        abi: NFTLogic.abi
    }],
    ["Empty", {
        name: "Empty",
        instances:[],
        abi: Staker.abi
    }]
]);

export const Networks: Map<NetworkName, Network> = new Map<NetworkName, Network>([
    ["Not Connected", {
        name: "Not Connected",
        icon: SolidityIcon,
        id: 0,
        hexID: "0x0",
        explorer: '',
        rpcUrl: '',
        faucet: null
    }],
    ["Ethereum", {
        name: "Ethereum",
        icon: EthereumIcon,
        id: 1,
        hexID: "0x1",
        explorer: "https://etherscan.io/",
        rpcUrl: "https://rpc.ankr.com/eth",
        faucet: null
    }],
    ["Goerli", {
        name: "Goerli",
        icon: GoerliIcon,
        id: 5,
        hexID: "0x5",
        explorer: "https://goerli.etherscan.io",
        rpcUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        faucet: "https://faucetlink.to/goerli"
    }],
    ["Binance Smart Chain", {
        name: "Binance Smart Chain",
        icon: BNBMainIcon,
        id: 56,
        hexID: "0x38",
        explorer: "https://bscscan.com",
        rpcUrl: "https://bsc-dataseed.binance.org/",
        faucet: null
    }],
    ["BNB Chain Testnet", {
        name: "BNB Chain Testnet",
        icon: BNBTestIcon,
        id: 97,
        hexID: "0x61",
        explorer: "https://testnet.bscscan.com",
        rpcUrl: "https://data-seed-prebsc-2-s3.binance.org:8545",
        faucet: "https://testnet.bnbchain.org/faucet-smart"
    }],
    ["Polygon", {
        name: "Polygon",
        icon: PolygonMainIcon,
        id: 137,
        hexID: "0x89",
        explorer: "https://explorer.matic.network/",
        rpcUrl: "https://polygon-rpc.com",
        faucet: null
    }],
    ["Polygon Mumbai", {
        name: "Polygon Mumbai",
        icon: PolygonTestIcon,
        id: 80001,
        hexID: "0x13881",
        explorer: "https://mumbai.polygonscan.com/",
        rpcUrl: "https://rpc-mumbai.maticvigil.com",
        faucet: "https://faucet.polygon.technology/"
    }]
]);

export const defaultConnection: AppConnectionData = {
    account: '',
    contract: Contracts.get("Empty")!,
    network: Networks.get("Not Connected")!,
    transactions: new Map<string, Web3Transaction>()
}