import { FaXTwitter } from "react-icons/fa6";
import { FaDiscord } from "react-icons/fa6";

export default function Header() {
    return (
        <div className="p-5 footer">
            <img className="footer-logo" src="/img/flipflop_logo.png"></img>
            <div className="footer-links">
                <a className="footer-link" href="/">Whitepaper</a>
                <a className="footer-link" href="/">Roadmap</a>
                <a className="footer-link" href="/"><FaXTwitter /></a>
                <a className="footer-link" href="/"><FaDiscord /></a>
            </div>
        </div>
    )
}
