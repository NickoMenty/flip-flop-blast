import { MoralisProvider } from "react-moralis"
import "../styles/globals.css"
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
                <title>SC Raffle</title>
                <meta name="description" content="SC Raffle" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <MoralisProvider initializeOnMount={false}>
                <NotificationProvider>
                    <Header />
                    <Footer />
                    <Component {...pageProps} />
                </NotificationProvider>
            </MoralisProvider>
        </div>
        
    )
}

export default MyApp
