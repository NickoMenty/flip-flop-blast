import { ConnectButton } from "web3uikit"
import Link from "next/link"

export default function Header() {
    return (
        <div className="p-5 header">
            <div className="flex flex-row items-center">
                <a className="explore" href="/stake">Stake</a>
            </div>
            <a href="/"><img className="header-logo" src="/img/flipflop_logo.png" alt="Logo" /></a>
            <ConnectButton moralisAuth={false} />
        </div>
    )
}
