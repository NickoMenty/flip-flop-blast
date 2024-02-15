const { ethers } = require("hardhat")

const networkConfig = {
    137: {
        name: "polygon",
        vrfCoordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
        enterenceFee: ethers.parseEther("0.01"),
        gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
        subscriptionId: "4433",
        callbackGasLimit: "500000",
        interval: "30",
    },
    11155111: {
        name: "sepolia",
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        enterenceFee: ethers.parseEther("0.01"),
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        subscriptionId: "4433",
        callbackGasLimit: "500000",
        interval: "30",
    },
    168587773: {
        name: "blastsepolia",
        enterenceFee: ethers.parseEther("0.0001"),
        interval: "30",
    },
    5: {
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        enterenceFee: ethers.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "4433",
        callbackGasLimit: "500000",
        interval: "30",
    },
    31337: {
        name: "hardhat",
        enterenceFee: ethers.parseEther("10"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "0",
        callbackGasLimit: "500000",
        interval: "30",
    },
    undefined: {
        name: "localhost",
        enterenceFee: ethers.parseEther("10"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "0",
        callbackGasLimit: "500000",
        interval: "30",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
