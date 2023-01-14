/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  CoinFlipper,
  CoinFlipperInterface,
} from "../../../contracts/D_Oracle_Contract/CoinFlipper";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint64",
        name: "_subscriptionId",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "_vrfCoordinator",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "have",
        type: "address",
      },
      {
        internalType: "address",
        name: "want",
        type: "address",
      },
    ],
    name: "OnlyCoordinatorCanFulfill",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "betPaidOut",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "betPlaced",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "fundsReceived",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "logNewQuery",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_result",
        type: "uint256",
      },
    ],
    name: "randomNumber",
    type: "event",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
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
        name: "_player",
        type: "address",
      },
    ],
    name: "getPlayerBalance",
    outputs: [
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
    inputs: [],
    name: "getReservedBalance",
    outputs: [
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
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "payOut",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "placeBet",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "playerQuery",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "players",
    outputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "awaitingQuery",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "randomWords",
        type: "uint256[]",
      },
    ],
    name: "rawFulfillRandomWords",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "reservedBalance",
    outputs: [
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
        internalType: "contract DemoToken",
        name: "_token",
        type: "address",
      },
    ],
    name: "setToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "startCoinFlip",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [
      {
        internalType: "contract DemoToken",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60a060405234801561001057600080fd5b5060405161102138038061102183398101604081905261002f916100cb565b806100393361007b565b6001600160a01b03908116608052600180546001600160401b03909416600160a01b026001600160e01b0319909416929091169190911791909117905561011d565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b600080604083850312156100de57600080fd5b82516001600160401b03811681146100f557600080fd5b60208401519092506001600160a01b038116811461011257600080fd5b809150509250929050565b608051610ee261013f600039600081816105d9015261061b0152610ee26000f3fe6080604052600436106100e85760003560e01c8063bf402cf31161008a578063e2eb41ff11610059578063e2eb41ff14610268578063f2fde38b146102b4578063f334c2eb146102d4578063fc0c546a146102e957600080fd5b8063bf402cf3146101c7578063d9a15549146101fd578063da333ca614610212578063e2734c931461023257600080fd5b80631fe543e3116100c65780631fe543e31461014a578063715018a61461016a5780638da5cb5b1461017f578063a1aabda6146101b157600080fd5b806310fe7c48146100ed57806312065fe014610102578063144fa6d71461012a575b600080fd5b6101006100fb366004610c8e565b610309565b005b34801561010e57600080fd5b50610117610532565b6040519081526020015b60405180910390f35b34801561013657600080fd5b50610100610145366004610cbc565b6105a4565b34801561015657600080fd5b50610100610165366004610cf6565b6105ce565b34801561017657600080fd5b50610100610656565b34801561018b57600080fd5b506000546001600160a01b03165b6040516001600160a01b039091168152602001610121565b3480156101bd57600080fd5b5061011760025481565b3480156101d357600080fd5b506101996101e2366004610c8e565b6003602052600090815260409020546001600160a01b031681565b34801561020957600080fd5b50600254610117565b34801561021e57600080fd5b5061010061022d366004610c8e565b61066a565b34801561023e57600080fd5b5061011761024d366004610cbc565b6001600160a01b031660009081526004602052604090205490565b34801561027457600080fd5b5061029f610283366004610cbc565b6004602052600090815260409020805460019091015460ff1682565b60408051928352901515602083015201610121565b3480156102c057600080fd5b506101006102cf366004610cbc565b6107db565b3480156102e057600080fd5b50610100610854565b3480156102f557600080fd5b50600554610199906001600160a01b031681565b600181101561036a5760405162461bcd60e51b815260206004820152602260248201527f436f696e466c69707065723a204d696e696d756d2062657420697320312044456044820152614d4f60f01b60648201526084015b60405180910390fd5b6005546040516370a0823160e01b815233600482015282916001600160a01b0316906370a0823190602401602060405180830381865afa1580156103b2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103d69190610dc0565b10156104245760405162461bcd60e51b815260206004820152601f60248201527f436f696e466c69707065723a20496e73756666696369656e742066756e6473006044820152606401610361565b3360009081526004602052604090206001015460ff16156104575760405162461bcd60e51b815260040161036190610dd9565b60055460405163079cc67960e41b8152336004820152602481018390526001600160a01b03909116906379cc679090604401600060405180830381600087803b1580156104a357600080fd5b505af11580156104b7573d6000803e3d6000fd5b505033600090815260046020526040812080548594509092506104db908490610e31565b9250508190555080600260008282546104f49190610e31565b909155505060405181815233907fd851eb5d36e0cdf525e06242299d6ac2548f7de9057acbdc8ae457444612169a906020015b60405180910390a250565b6005546040516370a0823160e01b81523060048201526000916001600160a01b0316906370a0823190602401602060405180830381865afa15801561057b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061059f9190610dc0565b905090565b6105ac610a53565b600580546001600160a01b0319166001600160a01b0392909216919091179055565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146106485760405163073e64fd60e21b81523360048201526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000166024820152604401610361565b6106528282610aad565b5050565b61065e610a53565b6106686000610c3e565b565b336000908152600460205260409020548111156106d55760405162461bcd60e51b8152602060048201526024808201527f436f696e466c69707065723a20496e76616c696420776974686472617720616d6044820152631bdd5b9d60e21b6064820152608401610361565b3360009081526004602052604090206001015460ff16156107085760405162461bcd60e51b815260040161036190610dd9565b3360009081526004602052604081208054839290610727908490610e4a565b9250508190555080600260008282546107409190610e4a565b90915550506005546040516308934a5f60e31b8152336004820152602481018390526001600160a01b039091169063449a52f890604401600060405180830381600087803b15801561079157600080fd5b505af11580156107a5573d6000803e3d6000fd5b50506040518381523392507fc7a9a103f9a82c916fbbaf86c7ac5f08a148bba81e940a295633f0c44371e6c59150602001610527565b6107e3610a53565b6001600160a01b0381166108485760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610361565b61085181610c3e565b50565b3360009081526004602052604090206001015460ff16156108875760405162461bcd60e51b815260040161036190610dd9565b3360009081526004602052604090205460018110156108e85760405162461bcd60e51b815260206004820152601960248201527f436f696e466c69707065723a20426574207265717569726564000000000000006044820152606401610361565b3360009081526004602052604081206001908101805460ff1916909117905560028054839290610919908490610e31565b9091555050600180546040516305d3b1d360e41b81527f79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c1560048201819052600160a01b830467ffffffffffffffff16602483015260036044830181905262030d40606484018190526084840186905291949093919290916000916001600160a01b0390911690635d3b1d309060a4016020604051808303816000875af11580156109c7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109eb9190610dc0565b6000818152600360205260409081902080546001600160a01b031916339081179091559051919250907f50c4464f23440d595acf2028444b0b0f289a83e75ba45e33c19edad171aca1e390610a439084815260200190565b60405180910390a2505050505050565b6000546001600160a01b031633146106685760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610361565b6000828152600360209081526040808320546001600160a01b031680845260049092529091206001015460ff16610b265760405162461bcd60e51b815260206004820152601e60248201527f436f696e466c69707065723a20556e736f6c69636974656420717565727900006044820152606401610361565b6000600283600081518110610b3d57610b3d610e5d565b6020026020010151610b4f9190610e73565b6001600160a01b0383166000908152600460205260409020549091506001829003610b9d57610b7f816002610e95565b6001600160a01b038416600090815260046020526040902055610bd8565b610ba8816002610e95565b60026000828254610bb99190610e4a565b90915550506001600160a01b0383166000908152600460205260408120555b6001600160a01b03831660009081526004602052604090819020600101805460ff191690555185907f116f6c045d9bde73d6ca74afb30bafbc2a69df98520beec5d66809c514549dde90610c2f9085815260200190565b60405180910390a25050505050565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b600060208284031215610ca057600080fd5b5035919050565b6001600160a01b038116811461085157600080fd5b600060208284031215610cce57600080fd5b8135610cd981610ca7565b9392505050565b634e487b7160e01b600052604160045260246000fd5b60008060408385031215610d0957600080fd5b8235915060208084013567ffffffffffffffff80821115610d2957600080fd5b818601915086601f830112610d3d57600080fd5b813581811115610d4f57610d4f610ce0565b8060051b604051601f19603f83011681018181108582111715610d7457610d74610ce0565b604052918252848201925083810185019189831115610d9257600080fd5b938501935b82851015610db057843584529385019392850192610d97565b8096505050505050509250929050565b600060208284031215610dd257600080fd5b5051919050565b60208082526022908201527f436f696e466c69707065723a20436f696e20666c697020696e2070726f677265604082015261737360f01b606082015260800190565b634e487b7160e01b600052601160045260246000fd5b80820180821115610e4457610e44610e1b565b92915050565b81810381811115610e4457610e44610e1b565b634e487b7160e01b600052603260045260246000fd5b600082610e9057634e487b7160e01b600052601260045260246000fd5b500690565b8082028115828204841417610e4457610e44610e1b56fea2646970667358221220e607abbde13d4a2e7ab6d3971907d5ab4c65e3de54c82c89e9a10e40b0ef4ac064736f6c63430008110033";

type CoinFlipperConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CoinFlipperConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CoinFlipper__factory extends ContractFactory {
  constructor(...args: CoinFlipperConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _subscriptionId: PromiseOrValue<BigNumberish>,
    _vrfCoordinator: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<CoinFlipper> {
    return super.deploy(
      _subscriptionId,
      _vrfCoordinator,
      overrides || {}
    ) as Promise<CoinFlipper>;
  }
  override getDeployTransaction(
    _subscriptionId: PromiseOrValue<BigNumberish>,
    _vrfCoordinator: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _subscriptionId,
      _vrfCoordinator,
      overrides || {}
    );
  }
  override attach(address: string): CoinFlipper {
    return super.attach(address) as CoinFlipper;
  }
  override connect(signer: Signer): CoinFlipper__factory {
    return super.connect(signer) as CoinFlipper__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CoinFlipperInterface {
    return new utils.Interface(_abi) as CoinFlipperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CoinFlipper {
    return new Contract(address, _abi, signerOrProvider) as CoinFlipper;
  }
}
