import { useMoralis } from "react-moralis"
import { useEffect } from "react"

export default function ManualHeader() {
    // hooks are a way to work and update a state of a front-end
    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
        useMoralis()
    // account shows is there a web3 connected

    useEffect(() => {
        if (isWeb3Enabled) return
        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) {
                enableWeb3()
            }
        }
        console.log("HI")
        console.log(isWeb3Enabled)
    }, [isWeb3Enabled])
    // -------------useEffect: cheetsheet -------------
    // no dependecy array: - run anytime smth re-renders
    // CAREFUL! you can make a loop
    // blank dependency: - run once on load
    // dependencies in the array: - run anytime smth in array changes
    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed ${account}`)
            if (account == null) {
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("Null account found")
            }
        })
    }, [])

    // onClick={async () => { await enableWeb3()}} is responsible for connect Wallet
    return (
        <div>
            {account ? (
                <div>
                    Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                        if (typeof window !== "undefined") {
                            window.localStorage.setItem("connected", "injected")
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    )
}
