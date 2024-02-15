const { ethers, network } = require("hardhat")
const fs = require("fs")

const FRONT_END_ADDRESSES_FILE = "../nextjs-raffle-toolbox-try-blast/constants/contractAddresses.json"
const FRONT_END_ABI_FILE = "../nextjs-raffle-toolbox-try-blast/constants/abi.json"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating front end....")
        await updateContractAddresses()
        await updateABI()
    }
}

async function updateABI() {
    const _raffle = await deployments.get("Raffle")
    const raffle = await ethers.getContractAt("Raffle", _raffle.address)
    fs.writeFileSync(FRONT_END_ABI_FILE, raffle.interface.formatJson())
    console.log("Updated ABI")
}

async function updateContractAddresses() {
    const chainId = network.config.chainId.toString()
    const _raffle = await deployments.get("Raffle")
    const raffle = await ethers.getContractAt("Raffle", _raffle.address)
    const currentAddresses = JSON.parse(fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8"))
    if (chainId in currentAddresses) {
        console.log("Already has this chainID")
        if (!currentAddresses[chainId].includes(raffle.target)) {
            currentAddresses[chainId].push(raffle.target)
        }
    }
    {
        console.log("Doesn't have this chainID")
        currentAddresses[chainId] = [raffle.target]
    }
    console.log("Updated Address")
    fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses))
}

module.exports.tags = ["all", "frontend"]
