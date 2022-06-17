import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'


// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

export default function Home() {




  // Render Methods
  const renderNotConnectedContainer = () => (
    <div className={styles.connectWalletContainer}>
      <img src="/assets/nerdzone.git" alt="Nerd gif" />
      <button className={`${styles.ctaButton} ${styles.connectWalletButton}`}>
        {/* <button className="cta-button connect-wallet-button"> */}
        Connect Wallet
      </button>
    </div>
  );



  return (
    <div className={styles.App}>
      <Head>
        <title>Nerd Name Service</title>
        <meta name="description" content="a new nerds naming service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <div className={styles.container}>
        <div className={styles.headerContainer}>

          {/* <div className={styles.left}> */}

          <img alt="Nerds Icon" className={styles.nerdIcon} src="/assets/nerd_icon.png" />
          <h1 className={styles.title}>
            Nerd Name Service
          </h1>
          <p className={styles.subtitle}>
            Welcome to Your immortal API on the blockchain!
          </p>
          {/* </div> */}
        </div>

        {renderNotConnectedContainer()}




        <div className={styles.footerContainer}>
          <img alt="Twitter Logo" className={styles.twitterLogo} src="/assets/twitter-logo.svg" />
          <a
            className={styles.footerText}
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE} `}</a>
          <a
            className={styles.footerText}
            href={'https://twitter.com/zainamroti'}
            target="_blank"
            rel="noreferrer"
          >{` by SZeeS @zainamroti `}</a>
        </div>

      </div>



    </div>
  )
}
