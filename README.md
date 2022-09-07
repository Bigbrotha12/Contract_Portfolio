# Smart Contract Portfolio

This repository serves as reference point for base smart contract apps which can be extended to production applications. Each section is designed to showcase different technologies and target industries in the web3 space.

## Content

### DeFi: Merkle Airdrop

Merkle airdrops are the next iteration of airdrop contracts and are designed to be more gas-efficient and practical than original airdrop
implementations. The main different with Merkle airdrop is that token aidrops are claimed by users rather automatically sent to them. Hence
gas cost is paid by the users rather than the sponsoring company. The contract uses merkle tree structure and proofs to verify each user's
claim of the airdrop and ensures none are paid more than once.

### Infrastructure: Interblockchain Bridge Gateway

With the multitude of blockchains, it has become more common for users and applications to want to operate across different ecosystem with their same digital assets. This needs is met through blockchain bridges that allow for information and digital assets to travel across chains. For valuable assets such as ERC20 tokens it is always recommended to use existing infrastructure with proper security model and insurance but for custom assets and cross-chain messaging it may be require for a project to maintain their own cross-chain messaging protocol.

The cross-chain bridge contract implemented here allows for a project to send messages across chains to allow users to port their NFTs to another chain. The server/relay infrastructure is not included in the demo but it is a key component of the protocol. The gateway simply enforces the on-chain security by defining and verifying valid messages from users and protocol owners.

### GameFi: Oracle-enabled Gambling dApp

Several applications in DeFi and GameFi require the use of external data outside the blockchain. The main challenge is ensuring that the external data hasn't been tampered with and can be trusted. For this purpose oracle providers such as Chainlink have developed a protocol for ensuring external data is reliable and secure.

This smart contract makes use of Chainlink VRF oracle for the generation of random numbers which can then be used in gambling games. The use of oracles in this way ensures the security of the dApp by not allowing a single individual to manipulate the outcome of the game and gives users assurance that their game is fair.

### DeFi: ERC20 with Fee-on-Transfer and Reflection Mechanics

Many ERC20 todays make use of on-chain business logic to implement certain behavior, such as automated taxation and staking. The contract here implements one of such mechanics. It allows the protocol owner to automatically take a portion of the transacted value and redistribute it among business accounts, and other users as reward for holding.

### DeFi: Staking Application for ERC20 Tokens

Another common use of smart contracts in DeFi is staking. Through staking users can deposit digital asset into a protocol and have protocol owners distribute reward to the users in proportion to their deposited amount and time staked.

### GameFi: Upgradable-Proxy NFT Application with Interface to IMX L2 ZK-Rollup

This contract is an implementation of an NFT contract with IMX L2 interface for minting new NFT with the ability to be upgraded overtime by the protocol owner. This is achieved through the use of transparent proxy that routes calls it depending on the sender. Thus, the administrator will only have access to set admin variables such as royalty fees, IMX gateway contract will have access only to the minting function, and users will only have access to the basic NFT functionality.
