const { network, ethers, deployments, namedAccounts } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")
require("dotenv").config()

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle units tests", function () {
          let raffle, raffleEntranceFee, deployer
          beforeEach(async () => {
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              player = accounts[0]
              //   deployer = (await getNamedAccounts()).deployer
              //   raffle = new ethers.Contract(contractAddress, abi, player)

              const _raffle = await deployments.get("Raffle")
              raffle = await ethers.getContractAt("Raffle", _raffle.address, player)

              raffleEntranceFee = await raffle.getEntranceFee()
          })
          describe("fulfillRandomWords", function () {
              it("Works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async () => {
                  console.log("Setting up test...")
                  const startingTimeStamp = await raffle.getLatestTimestamp()
                  accounts = await ethers.getSigners()

                  console.log("Setting up Listener...")

                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("Winner picked event fired")
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = Number(
                                  await ethers.provider.getBalance(player),
                              )
                              const endingTimeStamp = await raffle.getLatestTimestamp()
                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(
                                  winnerEndingBalance,
                                  winnerStatringBalance + Number(raffleEntranceFee),
                              )
                              assert.equal(recentWinner.toString(), player.address)
                              assert.equal(raffleState, 0)
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })
                      console.log("Entering Raffle...")
                      const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
                      await tx.wait(1)
                      console.log("Ok, time to wait...")
                      const winnerStatringBalance = Number(await ethers.provider.getBalance(player))
                  })
              })
          })
      })
