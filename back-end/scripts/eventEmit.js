const { network, ethers, deployments, namedAccounts } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")

let raffle, raffleEntranceFee, interval, player, accounts

const { abi, contractAddress } = require("../constants")

async function setUp() {
    accounts = await ethers.getSigners() // could also do with getNamedAccounts
    player = accounts[0]

    const _raffle = await deployments.get("Raffle")
    const raffleContract = await ethers.getContractAt("Raffle", _raffle.address)
    raffle = raffleContract.connect(player) // Returns a new instance of the Raffle contract connected to player

    console.log(_raffle.address)

    const vrfCoordinatorV2 = new ethers.Contract(contractAddress, abi, player)

    raffleEntranceFee = await raffle.getEntranceFee()
    interval = await raffle.getInterval()

    await new Promise(async (resolve, reject) => {
        raffle.once("WinnerPicked", async () => {
            console.log("Event Fired")
            const winnertxReciept = await winnerTx.wait(1)
            const winnerAccount = winnertxReciept.logs[1].args
            console.log(`winnerAccount: ${winnerAccount}`)
        })
        console.log("Entering Raffle...")
        const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
        await tx.wait(1)
        console.log("Ok, time to wait...")
        const txResponse = await raffle.performUpkeep("0x")
        const txReceipt = await txResponse.wait(1)
        const requestId = txReceipt.logs[1].args.requestId
        console.log("RequestId is found..")
        const winnerTx = vrfCoordinatorV2.fulfillRandomWords(requestId, raffle.address)
    })
}

await new Promise(async (resolve, reject) => {
    raffle.once("WinnerPicked", async () => {
        handleSuccess()
        resolve()
    })
    await enterRaffle({
        onError: (error) => console.log(error),
    })
})

setUp()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
