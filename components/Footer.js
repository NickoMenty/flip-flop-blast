import { FaXTwitter } from "react-icons/fa6";
import { FaDiscord } from "react-icons/fa6";

export default function Footer() {
    return (
        <div className="p-5 footer">
            <img className="footer-logo" src="/img/flipflop_logo.png"></img>
            <div className="footer-links">
                <a className="footer-link" href="https://flip-flop.gitbook.io/ffdocs/">Whitepaper</a>
                <a className="footer-link" href="https://flip-flop.gitbook.io/ffdocs/roadmap-and-plans">Roadmap</a>
                <a className="footer-link" href="https://twitter.com/ffonblast"><FaXTwitter /></a>
                <a className="footer-link" href="https://discord.gg/DTqzYtfDwQ"><FaDiscord /></a>
            </div>
        </div>
    )
}
