# Smart Contract Portfolio

This repository serves as reference point for useful smart contract templates, libraries, and interfaces. Contracts are based off existing smart contracts, OpenZeppelin libraries, and own development. Feel free to make use of these template or propose any improvement.

## Content

### ERC20 Token Template

Following the popular OpenZeppelin ERC20 template, contracts/Token/basicCoin.sol implements ERC20 token ready for deployment on to mainnet. Template allows for easy customization and extensions. Current contract extensions are:

| Extension                       | Description                                                                     |
| ------------------------------- | :------------------------------------------------------------------------------ |
| Minting/burning                 | Allows administrator or algorithm to create/destroy tokens                      |
| Burn-on-Transaction             | Makes token deflationary as a % of every transaction is destroyed               |
| Oracle Request                  | Allows your token to react to external data and make API calls                  |
| Gasless staking                 | Pioneered by reflect.finance, this distributes % of transaction to token holders|
| Auto-liquidity                  | Allows for % of transaction to be added to liquidity pools automatically        |

Got an idea or request for an extension? Let me know!

## Interfaces

Common interfaces to useful Ethereum smart contracts. Among these are:
- BandReferenceData, AggregatorV3, ChainlinkClient, and VRFConsumerBase to allow contract to query oracles
- IERC20 for standard token interaction
- UniswapRouter and Factory for creating liquidity pools and automatic swaps.

## Proxy

Set of contract templates to allow for upgradeable smart contracts following the Proxy/Implementation pattern. For a quick introduction to proxy contracts, see:
https://blog.openzeppelin.com/proxy-patterns/

## Contact me

Email me at firechain.contact@gmail.com
