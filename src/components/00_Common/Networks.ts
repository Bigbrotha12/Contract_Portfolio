import { Network, Contract } from "./Definitions";

import Airdrop from '../../../contracts/1_Airdrop/build/contracts/AirdropClaim.json';
import Bridge from '../../../contracts/2_IBC_Messenger/build/contracts/IBC_Bridge.json';
import Flipper from '../../../contracts/3_Oracle_Contract/build/contracts/CoinFlipper.json';
import Reflect from '../../../contracts/4_Reflect_Token/build/contracts/ReflectToken.json';
import Staker from '../../../contracts/5_Staker/build/contracts/Staking.json';
import NFT from '../../../contracts/6_Upgradable_NFT/build/contracts/FamiliarProxy.json';

export const Contracts: Array<Contract> =
[
    {
        name: "Airdrop",
        address: "",
        abi: Airdrop.abi
    },
    {
        name: "Bridge",
        address: "",
        abi: Bridge.abi
    },
    {
        name: "Flipper",
        address: "",
        abi: Flipper.abi
    },
    {
        name: "Reflect",
        address: "",
        abi: Reflect.abi
    },
    {
        name: "Staker",
        address: "",
        abi: Staker.abi
    },
    {
        name: "NFT",
        address: "",
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
