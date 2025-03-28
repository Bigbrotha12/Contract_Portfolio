import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET_RPC || ""
      }
    },
    mainnet: {
      url: process.env.MAINNET_RPC,
      accounts: [process.env.DEPLOY_PRIV || ""]
    },
    goerli: {
      url: process.env.GOERLI_RPC,
      accounts: [process.env.DEPLOY_PRIV || ""]
    },
    binanceMain: {
      url: process.env.BINANCE_RPC,
      accounts: [process.env.DEPLOY_PRIV || ""]
    },
    binanceTest: {
      url: process.env.BINANCE_TEST_RPC,
      accounts: [process.env.DEPLOY_PRIV || ""]
    },
    polygonMain: {
      url: process.env.POLYGON_RPC,
      accounts: [process.env.DEPLOY_PRIV || ""]
    },
    polygonTest: {
      url: process.env.POLYGON_TEST_RPC,
      accounts: [process.env.DEPLOY_PRIV || ""]
    },
    avalancheCMain: {
      url: process.env.AVAC_RPC,
      accounts: [process.env.DEPLOY_PRIV || ""]
    },
    avalancheCTest: {
      url: process.env.AVAC_TEST_RPC,
      accounts: [process.env.DEPLOY_PRIV || ""]
    }
  },
  mocha: {
    timeout: 40000
  },
  etherscan: {
    apiKey: "S9TIR39DG6AG13P77G3EJ4JJWN44W4Q4J4"
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};

export default config;

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deploy", "Deploys contract to network").addPositionalParam("contract", "Contract to deploy.").addOptionalParam("constructorArgs", "path to JSON with constructor arguments.").setAction(async (taskArgs, hre) => {

  try
  {
    let constructorArgs;
    if (taskArgs.constructorArgs) {
      constructorArgs = await import(taskArgs.constructorArgs, {
        assert: {
          type: "json",
        }
      });
    }
    
    const contract = await (await hre.ethers.getContractFactory(taskArgs.contract)).deploy(...constructorArgs[taskArgs.contract] || null);
    console.log(`Contract ${taskArgs.contract} deployed at ${contract.address}`);
  }
  catch (error)
  {
    if (error.code === 'MODULE_NOT_FOUND')
    {
      console.error("Invalid constructor argument file path. Ensure JSON file exists at the provided path and arguments are entered in correct order: hardhat deploy [contract-name] [arguments-path].");
    } else if (error.number === 700)
    {
      console.error("Invalid contract name. Ensure contract name matches file and arguments are entered in correct order: hardhat deploy [contract-name] [arguments-path].");
    } else
    {
      console.log(error.number);
    }
  }
});

