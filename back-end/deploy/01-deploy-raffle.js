const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// const VRF_SUB_FUND_AMOUNT = ethers.parseEther("1")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    // here we grap an account that we listed in config | row: 41
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock, vrfCoordinatorInstance

    // if (developmentChains.includes(network.name)) {
    //     const signer = await ethers.getSigner(deployer)

    //     vrfCoordinatorV2Mock = await deployments.get("VRFCoordinatorV2Mock")
    //     vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    //     vrfCoordinatorInstance = await ethers.getContractAt(
    //         "VRFCoordinatorV2Mock",
    //         vrfCoordinatorV2Address,
    //         signer,
    //     )
    //     // const contracts = await deployments.fixture(["mocks", "raffle"])
    //     // const _vrfCoordinatorV2Mock = contracts["VRFCoordinatorV2Mock"]
    //     // vrfCoordinatorV2Address = _vrfCoordinatorV2Mock.address
    //     // vrfCoordinatorInstance = await ethers.getContractAt(
    //     //     "VRFCoordinatorV2Mock",
    //     //     _vrfCoordinatorV2Mock.address,
    //     //     signer,
    //     // )

    //     const transactionResponse = await vrfCoordinatorInstance.createSubscription()
    //     const transactionReceipt = await transactionResponse.wait()

    //     subscriptionId = transactionReceipt.logs[0].args.subId
    //     await vrfCoordinatorInstance.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    //     // await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address)
    // } else {
    //     vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
    //     subscriptionId = networkConfig[chainId]["subscriptionId"]
    // }
    const enterenceFee = networkConfig[chainId]["enterenceFee"]
    // const gasLane = networkConfig[chainId]["gasLane"]
    // const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    // const interval = networkConfig[chainId]["interval"]
    const args = [
        enterenceFee,
    ]
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(raffle.address, args)
    }

    log("_____________________________________________________")
}

module.exports.tags = ["all", "raffle"]
