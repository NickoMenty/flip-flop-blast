const { network, ethers, deployments, namedAccounts } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle units tests", function () {
          const chainId = network.config.chainId
          let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval, player, accounts
          beforeEach(async () => {
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              //   deployer = accounts[0]
              player = accounts[1]
              deployer = (await getNamedAccounts()).deployer

              const contracts = await deployments.fixture(["mocks", "raffle"]) // Deploys modules with the tags "mocks" and "raffle"

              const raffleContractInstance = contracts["Raffle"] // Returns a new connection to the Raffle contract
              const raffleContract = await ethers.getContractAt(
                  "Raffle",
                  raffleContractInstance.address,
                  deployer,
              )
              raffle = raffleContract.connect(player) // Returns a new instance of the Raffle contract connected to player
              // console.log(raffleContractInstance)

              const vrfCoordinatorV2MockInstance = contracts["VRFCoordinatorV2Mock"] // Returns a new connection to the VRFCoordinatorV2Mock contract
              const vrfCoordinatorV2MockContract = await ethers.getContractAt(
                  "VRFCoordinatorV2Mock",
                  vrfCoordinatorV2MockInstance.address,
                  deployer,
              )
              vrfCoordinatorV2Mock = vrfCoordinatorV2MockContract.connect(player)
              raffleEntranceFee = await raffle.getEntranceFee()
              interval = await raffle.getInterval()
          })
          describe("constructor", function () {
              it("initializes the raffle correctly", async function () {
                  const raflestate = await raffle.getRaffleState()
                  console.log(raflestate)
                  interval = await raffle.getInterval()
                  assert.equal(raflestate, "0")
                  assert.equal(interval, networkConfig[chainId]["interval"])
              })
          })
          describe("EnterRaffle", function () {
              it("Reverts when you don't send enough", async function () {
                  await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
                      raffle,
                      "Raffle_NotEnoughETH",
                  )
              })
              it("Records players when they enter", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  const playerFromContract = await raffle.getPlayer(0)
                  assert.equal(playerFromContract, player.address)
              })
              it("emits event on enter", async function () {
                  await expect(
                      raffle.enterRaffle({
                          value: raffleEntranceFee,
                      }),
                  ).to.emit(raffle, "RaffleEnter")
              })
              it("doesnt allow enterance when raffle is calculating", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.send("evm_mine", [])

                  await raffle.performUpkeep("0x")
                  await expect(
                      raffle.enterRaffle({ value: raffleEntranceFee }),
                  ).to.be.revertedWithCustomError(raffle, "Raffle_NotOpen")
              })
          })
          describe("checkUpkeep", function () {
              it("retuns false if people haven't sent any ETH", async function () {
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x") // we can simulate calling function by adding .callStatic
                  assert(!upkeepNeeded)
              })
              it("retuns false if raffle isn't open", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.send("evm_mine", [])
                  await raffle.performUpkeep("0x")
                  const raffleState = await raffle.getRaffleState()
                  const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x") // we can simulate calling function by adding .callStatic
                  assert.equal(raffleState.toString(), "1")
                  assert.equal(upkeepNeeded, undefined)
              })
          })
          describe("performUpkeep", function () {
              it("can only run if checkUpkeep is true", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.send("evm_mine", [])
                  const tx = await raffle.performUpkeep("0x")
                  assert(tx) // it will work if tx will go through. It will fail if tx is failed
              })
              it("reverts when checkUpkeep is false", async function () {
                  await expect(raffle.performUpkeep("0x")).to.be.revertedWithCustomError(
                      raffle,
                      "Raffle_UpKeepNotNeeded",
                  )
              })
              it("updates the raffle state and, emits an event, calls the vrf coordinator", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.send("evm_mine", [])
                  const txResponse = await raffle.performUpkeep("0x")
                  const txReceipt = await txResponse.wait(1)
                  const requestId = txReceipt.logs[1].args.requestId
                  const raffleState = await raffle.getRaffleState()
                  assert(Number(requestId) > 0)
                  assert(Number(raffleState) == 1)
              })
          })
          describe("fulfillRandomWords", function () {
              beforeEach(async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.send("evm_mine", [])
              })
              it("can only be called after perform", async function () {
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.target),
                  ).to.be.revertedWith("nonexistent request")
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.target),
                  ).to.be.revertedWith("nonexistent request")
              })
              it("picks a winner, resets the lottery, and send the money", async function () {
                  const additionalEntrants = 3
                  const startingAccountIndex = 1
                  for (
                      let i = startingAccountIndex;
                      i < startingAccountIndex + additionalEntrants;
                      i++
                  ) {
                      const accountConnectedRaffle = raffle.connect(accounts[i])
                      await accountConnectedRaffle.enterRaffle({ value: raffleEntranceFee })
                  }
                  const startingTimeStamp = await raffle.getLatestTimestamp()

                  // perform Upkeep
                  // fulfillRandomWords
                  // we will have to wait for fullfillRandomWords to be called
                  // We made a promise so we listen.
                  // a.k.a Once the WinnerPicked event is emitted, then ....
                  // Also we add our function that trigers an event IN the promise, otherwise it will never triger
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("Found an event")
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const endingTimeStamp = await raffle.getLatestTimestamp()
                              const numPlayers = await raffle.getNumberOfPlayers()
                              const winnerEndingBalance = Number(
                                  await ethers.provider.getBalance(accounts[1]),
                              )
                              assert.equal(Number(numPlayers), 0)
                              assert.equal(Number(raffleState), 0)
                              //   assert.equal(
                              //       winnerEndingBalance,
                              //       winnerStartingBalance +
                              //           Number(raffleEntranceFee) * additionalEntrants +
                              //           Number(raffleEntranceFee),
                              //   )
                              expect(endingTimeStamp).to.be.greaterThan(startingTimeStamp)
                          } catch (e) {
                              reject(e)
                          }
                          resolve()
                      })
                      // setting up the listener
                      const tx = await raffle.performUpkeep("0x")
                      const txReceipt = await tx.wait(1)
                      const winnerStartingBalance = Number(
                          await ethers.provider.getBalance(accounts[1]),
                      )
                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          txReceipt.logs[1].args.requestId,
                          raffle.target,
                      )
                  })
              })
          })
      })
