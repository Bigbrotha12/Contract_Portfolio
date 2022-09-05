import Web3 from "web3";
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import Contracts from "../Constants/Contracts";
import { ContractInstance } from "../Constants/Web3Enums";

function contractInterface(instance: ContractInstance, provider: any): Contract {
    let web3 = new Web3(provider);
    return new web3.eth.Contract(Contracts[instance].abi as AbiItem[], Contracts[instance].address);
}

export default contractInterface;