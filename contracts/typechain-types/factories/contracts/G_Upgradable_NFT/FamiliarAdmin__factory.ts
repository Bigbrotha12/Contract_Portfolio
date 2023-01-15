/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  FamiliarAdmin,
  FamiliarAdminInterface,
} from "../../../contracts/G_Upgradable_NFT/FamiliarAdmin";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "fee",
        type: "uint96",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "royaltyUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "deleteDefaultRoyalty",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "resetTokenRoyalty",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_salePrice",
        type: "uint256",
      },
    ],
    name: "royaltyInfo",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_receiver",
        type: "address",
      },
      {
        internalType: "uint96",
        name: "_feeNumerator",
        type: "uint96",
      },
    ],
    name: "setDefaultRoyalty",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_receiver",
        type: "address",
      },
      {
        internalType: "uint96",
        name: "_feeNumerator",
        type: "uint96",
      },
    ],
    name: "setTokenRoyalty",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061067a806100206000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c806301ffc9a71461006757806304634d8d146100a05780632a55205a146100b55780635944c753146100e75780638a616bc0146100fa578063aa1b103f1461010d575b600080fd5b61008b61007536600461047f565b6001600160e01b03191663152a902d60e11b1490565b60405190151581526020015b60405180910390f35b6100b36100ae3660046104e3565b610115565b005b6100c86100c3366004610516565b61015f565b604080516001600160a01b039093168352602083019190915201610097565b6100b36100f5366004610538565b61020b565b6100b3610108366004610574565b610256565b6100b36102bb565b61011f82826102f1565b604080516001600160601b0383168152600060208201526001600160a01b0384169160008051602061062583398151915291015b60405180910390a25050565b6000828152600a602090815260408083208151808301909252546001600160a01b038116808352600160a01b9091046001600160601b03169282019290925282916101d45750604080518082019091526009546001600160a01b0381168252600160a01b90046001600160601b031660208201525b6020810151600090612710906101f3906001600160601b03168761058d565b6101fd91906105b8565b915196919550909350505050565b6102168383836103b4565b604080516001600160601b0383168152602081018590526001600160a01b03841691600080516020610625833981519152910160405180910390a2505050565b6000818152600a60205260408120556040805180820182526009546001600160a01b038116808352600160a01b9091046001600160601b0316602080840182905284519182528101859052919290916000805160206106258339815191529101610153565b6102c56000600955565b6040805160008082526020820181905291600080516020610625833981519152910160405180910390a2565b6127106001600160601b03821611156103255760405162461bcd60e51b815260040161031c906105da565b60405180910390fd5b6001600160a01b03821661037b5760405162461bcd60e51b815260206004820152601960248201527f455243323938313a20696e76616c696420726563656976657200000000000000604482015260640161031c565b604080518082019091526001600160a01b039092168083526001600160601b039091166020909201829052600160a01b90910217600955565b6127106001600160601b03821611156103df5760405162461bcd60e51b815260040161031c906105da565b6001600160a01b0382166104355760405162461bcd60e51b815260206004820152601b60248201527f455243323938313a20496e76616c696420706172616d65746572730000000000604482015260640161031c565b6040805180820182526001600160a01b0393841681526001600160601b0392831660208083019182526000968752600a90529190942093519051909116600160a01b029116179055565b60006020828403121561049157600080fd5b81356001600160e01b0319811681146104a957600080fd5b9392505050565b80356001600160a01b03811681146104c757600080fd5b919050565b80356001600160601b03811681146104c757600080fd5b600080604083850312156104f657600080fd5b6104ff836104b0565b915061050d602084016104cc565b90509250929050565b6000806040838503121561052957600080fd5b50508035926020909101359150565b60008060006060848603121561054d57600080fd5b8335925061055d602085016104b0565b915061056b604085016104cc565b90509250925092565b60006020828403121561058657600080fd5b5035919050565b80820281158282048414176105b257634e487b7160e01b600052601160045260246000fd5b92915050565b6000826105d557634e487b7160e01b600052601260045260246000fd5b500490565b6020808252602a908201527f455243323938313a20726f79616c7479206665652077696c6c206578636565646040820152692073616c65507269636560b01b60608201526080019056fec10da2032b8388ba43414451574b17b18b976a4a2f64a289dfcfbbdf21973289a2646970667358221220f04e9a781dfb817799742870d4422ea906a7628202b124419cd92860c4339ae764736f6c63430008110033";

type FamiliarAdminConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FamiliarAdminConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FamiliarAdmin__factory extends ContractFactory {
  constructor(...args: FamiliarAdminConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FamiliarAdmin> {
    return super.deploy(overrides || {}) as Promise<FamiliarAdmin>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): FamiliarAdmin {
    return super.attach(address) as FamiliarAdmin;
  }
  override connect(signer: Signer): FamiliarAdmin__factory {
    return super.connect(signer) as FamiliarAdmin__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FamiliarAdminInterface {
    return new utils.Interface(_abi) as FamiliarAdminInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FamiliarAdmin {
    return new Contract(address, _abi, signerOrProvider) as FamiliarAdmin;
  }
}