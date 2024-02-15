require("@nomicfoundation/hardhat-toolbox")
require("@nomicfoundation/hardhat-ethers")
require("hardhat-deploy")
require("hardhat-contract-sizer")
require("dotenv").config()

const BLAST_RPC_URL = process.env.BLAST_RPC_URL
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

module.exports = {
    solidity: {
        compilers: [{ version: "0.8.18" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL || "",
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            chainId: 11155111,
            saveDeployments: true,
        },
        blastsepolia: {
            url: BLAST_RPC_URL || "",
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            chainId: 168587773,
            saveDeployments: true,
        },
        // for local dev environment
        blastlocal: {
            url: "http://localhost:8545",
            chainId: 168587773,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            gasPrice: 1000000000,
        },
    },
    gasReporter: {
        enabled: false, //  true
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH", // or MATIC
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
        player: {
            default: 1,
        },
    },
    mocha: {
        timeout: 500000, // 500 sec max
    },
    etherscan: {
        // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
            blastsepolia: "https://api.routescan.io/v2/network/testnet/evm/168587773/etherscan",
        },
        customChains: [
            {
                network: "sepolia",
                chainId: 11155111,
                urls: {
                    apiURL: "https://api-sepolia.etherscan.io/api",
                    browserURL: "https://sepolia.etherscan.io/",
                },
            },
            {
                network: "blastsepolia",
                chainId: 168587773,
                urls: {
                    apiURL: "https://api.routescan.io/v2/network/testnet/evm/168587773/etherscan",
                    browserURL: "https://testnet.blastscan.io"
                }
            }
        ],
    },
}
