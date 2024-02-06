import { MoralisProvider } from "react-moralis"
import "../styles/globals.css"
import "../styles/staking.css"
import "../styles/header.css"
import "../styles/main.css"
import "../styles/footer.css"
import { NotificationProvider } from "web3uikit"
import Head from "next/head"
import styles from "../styles/Home.module.css"
import Header from "../components/Header"
import Footer from "../components/Footer"
import LotteryEntrance from "../components/LotteryEntrance"

function MyApp({ Component, pageProps }) {
    return (
        <div className={styles.container}>
            <Head>
                <title>FlipFlop - Ultimate Web3 lottery on Blast blockchain</title>
                <meta name="description" content="FlipFlop" />
                <link rel="icon" href="/ff.png" />
            </Head>
            <MoralisProvider initializeOnMount={false}>
                <NotificationProvider>
                    <Header />
                    
                    <Component {...pageProps} />
                    <Footer />
                </NotificationProvider>
            </MoralisProvider>
        </div>
        
    )
}

export default MyApp
