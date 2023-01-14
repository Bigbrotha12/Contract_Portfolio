/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  FamiliarProxy,
  FamiliarProxyInterface,
} from "../../../../contracts/G_Upgradable_NFT/NFTDemo.sol/FamiliarProxy";

const _abi = [
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_routingConfig",
        type: "address[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "prevAdmin",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "adminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "version",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "contractUpgraded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "role",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "currentRouting",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "version",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "currentVersion",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "role",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "routingUpdated",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newAdmin",
        type: "address",
      },
    ],
    name: "changeAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_role",
        type: "address",
      },
      {
        internalType: "address",
        name: "_target",
        type: "address",
      },
    ],
    name: "changeRouting",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_role",
        type: "address",
      },
    ],
    name: "getRouting",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getVersion",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC165",
        name: "_impl",
        type: "address",
      },
      {
        internalType: "bytes[]",
        name: "_initData",
        type: "bytes[]",
      },
    ],
    name: "upgradeInit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604051620011d6380380620011d68339810160408190526200003491620001fd565b806000815181106200004a576200004a620002cf565b6020026020010151600b60006101000a8154816001600160a01b0302191690836001600160a01b03160217905550806001815181106200008e576200008e620002cf565b6020026020010151600d600083600081518110620000b057620000b0620002cf565b60200260200101516001600160a01b03166001600160a01b0316815260200190815260200160002060006101000a8154816001600160a01b0302191690836001600160a01b0316021790555080600281518110620001125762000112620002cf565b60200260200101516000806101000a8154816001600160a01b0302191690836001600160a01b0316021790555080600381518110620001555762000155620002cf565b6020026020010151600d600083600281518110620001775762000177620002cf565b60200260200101516001600160a01b03166001600160a01b0316815260200190815260200160002060006101000a8154816001600160a01b0302191690836001600160a01b0316021790555050620002e5565b634e487b7160e01b600052604160045260246000fd5b80516001600160a01b0381168114620001f857600080fd5b919050565b600060208083850312156200021157600080fd5b82516001600160401b03808211156200022957600080fd5b818501915085601f8301126200023e57600080fd5b815181811115620002535762000253620001ca565b8060051b604051601f19603f830116810181811085821117156200027b576200027b620001ca565b6040529182528482019250838101850191888311156200029a57600080fd5b938501935b82851015620002c357620002b385620001e0565b845293850193928501926200029f565b98975050505050505050565b634e487b7160e01b600052603260045260246000fd5b610ee180620002f56000396000f3fe6080604052600436106100595760003560e01c80630d8e6e2c14610070578063323e467e146100855780636ee2ebad146100a55780638bad0c0a146100c55780638f283970146100da578063c2f390fb146100fa57610068565b366100685761006661011a565b005b61006661011a565b34801561007c57600080fd5b5061006661012c565b34801561009157600080fd5b506100666100a0366004610a4f565b6101d4565b3480156100b157600080fd5b506100666100c0366004610ad7565b61072d565b3480156100d157600080fd5b50610066610808565b3480156100e657600080fd5b506100666100f5366004610b10565b610880565b34801561010657600080fd5b50610066610115366004610b10565b61094d565b61012a6101256109ba565b610a16565b565b600b546001600160a01b031633036101cc577f81955a0a11e65eac625c29e8882660bae4e165a75d72780094acae8ece9a29ee546001600160a01b03166000818152600e60205260409081902090516101859190610b6e565b6040519081900381206001600160a01b0383168252907fe7f82efab6c18528acb88a4ad3355b0af04fa862b93f426a81865b9f5dba6c21906020015b60405180910390a250565b61012a61011a565b600b546001600160a01b0316330361072057600b54600160a01b900460ff161561024f5760405162461bcd60e51b815260206004820152602160248201527f50726f78793a20496e697469616c697a6174696f6e20696e2070726f677265736044820152607360f81b60648201526084015b60405180910390fd5b6001600160a01b0383166000908152600c602052604090205460ff16156102c45760405162461bcd60e51b815260206004820152602360248201527f50726f78793a20436f6e747261637420616c726561647920696e697469616c696044820152621e995960ea1b6064820152608401610246565b6040516301ffc9a760e01b81526000906001600160a01b038516906301ffc9a7906102f7906380ac58cd90600401610be4565b602060405180830381865afa158015610314573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103389190610bfc565b80156103b057506040516301ffc9a760e01b81526001600160a01b038516906301ffc9a79061036f90635b5e139f90600401610be4565b602060405180830381865afa15801561038c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103b09190610bfc565b801561042857506040516301ffc9a760e01b81526001600160a01b038516906301ffc9a7906103e790632a55205a90600401610be4565b602060405180830381865afa158015610404573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104289190610bfc565b80156104a057506040516301ffc9a760e01b81526001600160a01b038516906301ffc9a79061045f9063459fb2ad90600401610be4565b602060405180830381865afa15801561047c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104a09190610bfc565b9050806104ef5760405162461bcd60e51b815260206004820152601d60248201527f50726f78793a20496e76616c69642075706772616465207461726765740000006044820152606401610246565b600b805460ff60a01b1916600160a01b1790556000808052600d6020527f81955a0a11e65eac625c29e8882660bae4e165a75d72780094acae8ece9a29ee80546001600160a01b0387166001600160a01b0319909116179055839083908161055957610559610c1e565b905060200281019061056b9190610c34565b6001600160a01b0386166000908152600e602052604090209161058f919083610ce6565b506000846001600160a01b031684846040516024016105af929190610dd0565b60408051601f198184030181529181526020820180516001600160e01b031663459fb2ad60e01b179052516105e49190610e6c565b600060405180830381855af49150503d806000811461061f576040519150601f19603f3d011682016040523d82523d6000602084013e610624565b606091505b50509050806106755760405162461bcd60e51b815260206004820152601c60248201527f50726f78793a20496e697469616c697a6174696f6e206661696c6564000000006044820152606401610246565b6001600160a01b0385166000908152600c60205260408120805460ff19166001179055600b805460ff60a01b1916905584908490816106b6576106b6610c1e565b90506020028101906106c89190610c34565b6040516106d6929190610e9b565b6040519081900381206001600160a01b0387168252907fa66469331350067059f17ece36e349771122a7af099f3d5b1a5e908c13115b089060200160405180910390a25050505050565b61072861011a565b505050565b600b546001600160a01b031633036107fc576001600160a01b0382166107955760405162461bcd60e51b815260206004820152601c60248201527f50726f78793a20496d70726f70657220726f757465206368616e6765000000006044820152606401610246565b6001600160a01b038281166000818152600d602090815260409182902080546001600160a01b0319169486169485179055905192835290917f595e84678f5bd8be84905365790d19a0b11fcb6111fb36dfe4d6502ccf58ffe7910160405180910390a25050565b61080461011a565b5050565b600b546001600160a01b031633036101cc57600b80546001600160a01b03198082169092556001600160a01b03166000818152600d6020908152604080832080549095169094559251908152909182917fbadc9a52979e89f78b7c58309537410c5e51d0f63a0a455efe8d61d2b474e69891016101c1565b600b546001600160a01b03163303610942576001600160a01b0381166108e85760405162461bcd60e51b815260206004820152601c60248201527f50726f78793a20496e76616c69642061646d696e2061646472657373000000006044820152606401610246565b600b80546001600160a01b038381166001600160a01b031983168117909355604051928352169081907fbadc9a52979e89f78b7c58309537410c5e51d0f63a0a455efe8d61d2b474e6989060200160405180910390a25050565b61094a61011a565b50565b600b546001600160a01b03163303610942576001600160a01b038181166000818152600d6020908152604091829020548251938452909316928201929092527fc7c08958687894c8309c6e64d2a9ecd5c17599ec8fcf324fb60de87832e82465910160405180910390a150565b336000908152600d60205260408120546001600160a01b031680610a1157505060008052600d6020527f81955a0a11e65eac625c29e8882660bae4e165a75d72780094acae8ece9a29ee546001600160a01b031690565b919050565b3660008037600080366000845af43d6000803e808015610a35573d6000f35b3d6000fd5b6001600160a01b038116811461094a57600080fd5b600080600060408486031215610a6457600080fd5b8335610a6f81610a3a565b9250602084013567ffffffffffffffff80821115610a8c57600080fd5b818601915086601f830112610aa057600080fd5b813581811115610aaf57600080fd5b8760208260051b8501011115610ac457600080fd5b6020830194508093505050509250925092565b60008060408385031215610aea57600080fd5b8235610af581610a3a565b91506020830135610b0581610a3a565b809150509250929050565b600060208284031215610b2257600080fd5b8135610b2d81610a3a565b9392505050565b600181811c90821680610b4857607f821691505b602082108103610b6857634e487b7160e01b600052602260045260246000fd5b50919050565b6000808354610b7c81610b34565b60018281168015610b945760018114610ba957610bd8565b60ff1984168752821515830287019450610bd8565b8760005260208060002060005b85811015610bcf5781548a820152908401908201610bb6565b50505082870194505b50929695505050505050565b60e09190911b6001600160e01b031916815260200190565b600060208284031215610c0e57600080fd5b81518015158114610b2d57600080fd5b634e487b7160e01b600052603260045260246000fd5b6000808335601e19843603018112610c4b57600080fd5b83018035915067ffffffffffffffff821115610c6657600080fd5b602001915036819003821315610c7b57600080fd5b9250929050565b634e487b7160e01b600052604160045260246000fd5b601f82111561072857600081815260208120601f850160051c81016020861015610cbf5750805b601f850160051c820191505b81811015610cde57828155600101610ccb565b505050505050565b67ffffffffffffffff831115610cfe57610cfe610c82565b610d1283610d0c8354610b34565b83610c98565b6000601f841160018114610d465760008515610d2e5750838201355b600019600387901b1c1916600186901b178355610da0565b600083815260209020601f19861690835b82811015610d775786850135825560209485019460019092019101610d57565b5086821015610d945760001960f88860031b161c19848701351681555b505060018560011b0183555b5050505050565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b60208082528181018390526000906040600585901b8401810190840186845b87811015610e5f57868403603f190183528135368a9003601e19018112610e1557600080fd5b8901858101903567ffffffffffffffff811115610e3157600080fd5b803603821315610e4057600080fd5b610e4b868284610da7565b955050509184019190840190600101610def565b5091979650505050505050565b6000825160005b81811015610e8d5760208186018101518583015201610e73565b506000920191825250919050565b818382376000910190815291905056fea264697066735822122006b182c07e7ba1afe485b75e6388692fbd2126ac70b00934f925d10d67e4278a64736f6c63430008110033";

type FamiliarProxyConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FamiliarProxyConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FamiliarProxy__factory extends ContractFactory {
  constructor(...args: FamiliarProxyConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _routingConfig: PromiseOrValue<string>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FamiliarProxy> {
    return super.deploy(
      _routingConfig,
      overrides || {}
    ) as Promise<FamiliarProxy>;
  }
  override getDeployTransaction(
    _routingConfig: PromiseOrValue<string>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_routingConfig, overrides || {});
  }
  override attach(address: string): FamiliarProxy {
    return super.attach(address) as FamiliarProxy;
  }
  override connect(signer: Signer): FamiliarProxy__factory {
    return super.connect(signer) as FamiliarProxy__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FamiliarProxyInterface {
    return new utils.Interface(_abi) as FamiliarProxyInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FamiliarProxy {
    return new Contract(address, _abi, signerOrProvider) as FamiliarProxy;
  }
}
