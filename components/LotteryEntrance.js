import { contractAddresses, abi } from "../constants"
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"
import Main from "./Main"
import CountdownTimer from "./Countdown"

export default function LotteryEntrance() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    // State hooks
    // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables
    const [entranceFee, setEntranceFee] = useState("0")
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [numberOfMyTickets, setNumberOfMyTickets] = useState("0")
    const [recentWinner, setRecentWinner] = useState("Loading...")

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        msgValue: entranceFee,
        params: {},
    })

    /* View Functions */

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, 
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getPlayersNumber } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getMyTicketsNumber } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "playerEntrances",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUIValues() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getPlayersNumber()).toString()
        const numMyEnterFromCall = (await getMyTicketsNumber()).toString()
        const recentWinnerFromCall = await getRecentWinner()
        setEntranceFee(entranceFeeFromCall)
        setNumberOfPlayers(numPlayersFromCall)
        setNumberOfMyTickets(numMyEnterFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="p-5">
            {raffleAddress ? (
                <section className="raffle">
                    
                    <button
                        className="enter"
                        onClick={async () =>
                            await enterRaffle({
                                // onComplete:
                                // onError:
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Raffle"
                        )}
                    </button>
                    
                    <div className="raffle-content">
                        <img className="raf-coins-l" src="/img/raf_coins_l.png"></img>   
                        <div className="winner">
                            <div className="stat stat-win">Previous winner</div> <span className="stat-num">{recentWinner} </span>
                            <img className="win" src="/img/win.png"></img>
                            <div className="raffle-stat">
                                <div className="stat-num">Price: <span className="stat-num">{ethers.utils.formatUnits(entranceFee, "ether")} ETH </span></div>
                                <div className="stat-num">All tickets: <span className="stat-num">{numberOfPlayers} </span></div>
                                <div className="stat-num">My tickets: <span className="stat-num">{numberOfMyTickets} </span></div>
                            </div>
                            <CountdownTimer />
                        </div>
                        <img className="raf-coins-r" src="/img/raf_coins_r.png"></img> 
                    </div>
                    
                </section>
            ) : (
                <Main/>
            )}
        </div>
    )
}
