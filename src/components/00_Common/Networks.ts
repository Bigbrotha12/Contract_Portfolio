import { Network, Contract } from "./Definitions";

import DemoToken from '../../../contracts/artifacts/contracts/A_DemoToken/DemoToken.sol/DemoToken.json';
import Airdrop from '../../../contracts/artifacts/contracts/B_Airdrop/AirdropDemo.sol/AirdropDemo.json';
import Bridge from '../../../contracts/artifacts/contracts/C_IBC_Messenger/IBC_Bridge.sol/IBC_Bridge.json';
import Flipper from '../../../contracts/artifacts/contracts/D_Oracle_Contract/CoinFlipper.sol/CoinFlipper.json';
import Reflect from '../../../contracts/artifacts/contracts/E_Reflect_Token/ReflectToken.sol/ReflectToken.json';
import Staker from '../../../contracts/artifacts/contracts/F_Staker/Staking.sol/Staking.json';
import NFT from '../../../contracts/artifacts/contracts/G_Upgradable_NFT/FamiliarProxy.sol/FamiliarProxy.json';

export const Contracts: Array<Contract> =
[
    {
        name: "Airdrop",
        instances:
        [
            {
                network: "mainnet",
                address: ""
            },
            {
                network: "mainnet",
                address: ""
            },
            {
                network: "mainnet",
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
                network: "mainnet",
                address: ""
            },
            {
                network: "mainnet",
                address: ""
            },
            {
                network: "mainnet",
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
                network: "mainnet",
                address: ""
            },
            {
                network: "mainnet",
                address: ""
            },
            {
                network: "mainnet",
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
                network: "mainnet",
                address: ""
            },
            {
                network: "mainnet",
                address: ""
            },
            {
                network: "mainnet",
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
                network: "mainnet",
                address: ""
            },
            {
                network: "mainnet",
                address: ""
            },
            {
                network: "mainnet",
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
                network: "mainnet",
                address: ""
            },
            {
                network: "mainnet",
                address: ""
            },
            {
                network: "mainnet",
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
        explorer: "",
        availableContracts: Contracts,
        rpcUrl: ""
    },
    {
        name: "Binance",
        id: 5,
        hexID: "0x5",
        explorer: "",
        availableContracts: Contracts,
        rpcUrl: ""
    }
]
