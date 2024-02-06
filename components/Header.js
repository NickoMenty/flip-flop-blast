import { ConnectButton } from "web3uikit"

export default function Header() {
    return (
        <div className="p-5 header">
            <a className="explore" href="/">Explore</a>
            <img className="header-logo" src="/img/flipflop_logo.png"></img>
            <ConnectButton moralisAuth={false} />
        </div>
    )
}
