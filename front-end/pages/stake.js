import { contractAddresses, abi } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"
import Main from "../components/Main"

export default function LotteryEntrance() {
    const { Moralis, account, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    // State hooks
    // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables

    const stakeAmount = 6900000000000000
    const [hasStaked, setHasStaked] = useState(false)

    const dispatch = useNotification()

    const {
        runContractFunction: stake,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "stake",
        msgValue: stakeAmount,
        params: {},
    })

    const {
        runContractFunction: withdrawStake
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "withdrawStake",
        params: {},
    })

    

    /* View Functions */

    const { runContractFunction: getHasStaked } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, 
        functionName: "hasStaked",
        params: {
            player: account,
        },
    })


    

    async function updateUIValues() {
        const hasStakefFromCall = await getHasStaked()
        setHasStaked(hasStakefFromCall)
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
                <section className="staking">
                    
                    <div className="raffle-content">
                        <img className="raf-coins-l" src="/img/raf_coins_l.png"></img>   
                        <div className="stake-wrapper">
                            <div className="stake">
                                Stake Amount: <span className="input">{ethers.utils.formatUnits(stakeAmount, "ether")} ETH </span>
                            </div>
                            {!hasStaked && (<button
                        className="enter enter-staking"
                        onClick={async () =>
                            await stake({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Stake"
                        )}
                    </button>)}
                    {hasStaked && (<button
                        className="enter enter-staking"
                        onClick={async () =>
                            await withdrawStake({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Withdraw"
                        )}
                    </button>
                    )}
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
