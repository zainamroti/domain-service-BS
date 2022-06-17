import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { TWITTER_HANDLE, TWITTER_LINK, CONTRACT_ADDRESS, tld, contractAbi } from '../constants'
import LoadingIndicator from '../components/LoadingIndicator'
import { useState, useEffect, useRef } from 'react'
import { providers, Contract, utils } from "ethers";
import Web3Modal from "web3modal";

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [network, setNetwork] = useState("");
  // Add a new stateful variable at the start of our component next to all the old ones
  const [editing, setEditing] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();
  const pattern = /(Polygon|polygon|matic)/i;

  // Add some state data propertie
  const [domain, setDomain] = useState('');
  const [record, setRecord] = useState('');
  const [mints, setMints] = useState([]);


  /**
     * Returns a Provider or Signer object representing the Ethereum RPC with or without the
     * signing capabilities of metamask attached
     *
     * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
     *
     * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
     * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
     * request signatures from the user using Signer functions.
     *
     * @param {*} needSigner - True if you need the signer, default false otherwise
     */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId, name } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Change the network to Polygon Mumbai");
      throw new Error("Change network to Polygon Mumbai");
    }
    setNetwork(name);
    console.log(`Network > ${name}`)

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /*
      connectWallet: Connects the MetaMask wallet
    */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      const provider = await getProviderOrSigner(true);
      setWalletConnected(true);
      const address = await provider.getAddress();
      console.log(address)
      setCurrentAccount(address)

    } catch (err) {
      console.error(err);
    }
  };



  // Render Methods
  const renderNotConnectedContainer = () => {
    if (walletConnected) {
      if (loading) {
        return (
          <div className={styles.formContainer}>
            <img src="/assets/nerdzone.gif" alt="Nerd gif" />
            <LoadingIndicator />
          </div>
        );


      }
      if (currentAccount) {
        return (
          <div className={styles.connectedWalletContainer}>
            <button size="small" className={`${styles.ctaButton} ${styles.connectedWalletButton}`}>
              Connected
            </button>
            <img src="/assets/nerdzone.gif" alt="Nerd gif" />
            {renderInputForm()}
          </div>
        )
      }

    } else {
      return (
        <div className={styles.connectWalletContainer}>
          <img src="/assets/nerdzone.gif" alt="Nerd gif" />
          <button onClick={connectWallet} className={`${styles.ctaButton} ${styles.connectWalletButton}`}>
            Connect Your Wallet
          </button>
        </div>
      );
    }
  }

  const fetchMints = async () => {
    try {
      // const { ethereum } = window;
      // if (ethereum) {
      // You know all this

      const signer = await getProviderOrSigner(true);
      const contract = new Contract(CONTRACT_ADDRESS, contractAbi, signer);

      // Get all the domain names from our contract
      const names = await contract.getAllNames();

      // For each name, get the record and the address
      const mintRecords = await Promise.all(names.map(async (name) => {
        const mintRecord = await contract.records(name);
        const owner = await contract.domains(name);
        return {
          id: names.indexOf(name),
          name: name,
          record: mintRecord,
          owner: owner,
        };
      }));

      console.log("MINTS FETCHED ", mintRecords);
      setMints(mintRecords);
      // }
    } catch (error) {
      console.log(error);
    }
  }

  // This will run any time currentAccount or network are changed
  useEffect(() => {
    if (pattern.test(network)) {
      fetchMints();
    }
  }, [currentAccount, network]);

  // Form to enter domain name and data
  const renderInputForm = () => {

    console.log(`IS net> ${pattern.test(network)}`)
    // If not on Polygon Mumbai Testnet, render "Please connect to Polygon Mumbai Testnet"
    if (!(pattern.test(network))) {
      return (
        <div className={styles.connectWalletContainer}>
          {/* <p>Please connect to the Polygon Mumbai Testnet</p> */}
          <h2>Please switch to Polygon Mumbai Testnet</h2>
          {/* This button will call our switch network function */}
          <button className={`${styles.ctaButton} ${styles.mintButton}`} onClick={switchNetwork}>Click here to switch</button>
        </div>
      );
    }


    return (
      <div className={styles.formContainer}>
        <div className={styles.firstRow}>
          <input
            type="text"
            value={domain}
            placeholder='domain'
            onChange={e => setDomain(e.target.value)}
          />
          <p className={styles.tld}> {tld} </p>
        </div>

        <input
          type="text"
          value={record}
          placeholder='whats ur nerd super power?'
          onChange={e => setRecord(e.target.value)}
        />

        {editing ? (<div className={styles.buttonContainer}>
          <button onClick={updateDomain} className={`${styles.ctaButton} ${styles.mintButton}`} disabled={loading} >
            Set record
          </button>
          <button className={`${styles.ctaButton} ${styles.mintButton}`} onClick={() => { setEditing(false) }}>
            Cancel
          </button>
        </div>)
          : (
            // If editing is not true, the mint button will be returned instead
            <button className={`${styles.ctaButton} ${styles.mintButton}`} disabled={loading} onClick={mintDomain}>
              Mint
            </button>
          )

        }

      </div>
    );
  }

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      // connectWallet();
    }
  }, [walletConnected]);

  const mintDomain = async () => {
    // Don't run if the domain is empty
    if (!domain) { return }
    // Alert the user if the domain is too short
    if (domain.length < 3) {
      alert('Domain must be at least 3 characters long');
      return;
    }

    // Calculate price based on length of domain (change this to match your contract)	
    // 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
    const price = domain.length === 3 ? '0.05' : domain.length === 4 ? '0.03' : '0.01';
    console.log("Minting domain", domain, "with price", price);
    setLoading(true);

    try {

      // if (web3ModalRef.current) {

      const signer = await getProviderOrSigner(true);
      const contract = new Contract(CONTRACT_ADDRESS, contractAbi, signer);

      console.log("Going to pop wallet now to pay gas...")
      let tx = await contract.register(domain, { value: utils.parseEther(price) });
      // Wait for the transaction to be mined
      const receipt = await tx.wait();

      // Check if the transaction was successfully completed
      if (receipt.status === 1) {
        console.log("Domain minted! https://mumbai.polygonscan.com/tx/" + tx.hash);

        // Set the record for the domain
        tx = await contract.setRecord(domain, record);
        await tx.wait();

        console.log("Record set! https://mumbai.polygonscan.com/tx/" + tx.hash);

        // Call fetchMints after 2 seconds
        setTimeout(() => {
          fetchMints();
        }, 2000);

        setRecord('');
        setDomain('');
      }
      else {
        alert("Transaction failed! Please try again");
      }
      // }
    }
    catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  const updateDomain = async () => {
    if (!record || !domain) { return }
    setLoading(true);
    console.log("Updating domain", domain, "with record", record);
    try {

      // if (ethereum) {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(CONTRACT_ADDRESS, contractAbi, signer);

      let tx = await contract.setRecord(domain, record);
      await tx.wait();
      console.log("Record set https://mumbai.polygonscan.com/tx/" + tx.hash);

      fetchMints();
      setRecord('');
      setDomain('');
      // }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        // Try to switch to the Mumbai testnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
        });
      } catch (error) {
        // This error code means that the chain we want has not been added to MetaMask
        // In this case we ask the user to add it to their MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x13881',
                  chainName: 'Polygon Mumbai Testnet',
                  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                  nativeCurrency: {
                    name: "Mumbai Matic",
                    symbol: "MATIC",
                    decimals: 18
                  },
                  blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        }
        console.log(error);
      }
    } else {
      // If window.ethereum is not found then MetaMask is not installed
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    }
  }

  const renderMints = () => {
    if (currentAccount && mints.length > 0) {
      return (
        <div className={styles.mintContainer}>
          <p className={styles.subtitle}> Recently minted domains!</p>
          <div className={styles.mintList}>
            {mints.map((mint, index) => {
              return (
                <div className={styles.mintItem} key={index}>
                  <div className={styles.mintRow}>
                    <a className={styles.link} href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer">
                      <p className="underlined">{' '}{mint.name}{tld}{' '}</p>
                    </a>
                    {/* If mint.owner is currentAccount, add an "edit" button*/}
                    {mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
                      <button className={styles.editButton} onClick={() => editRecord(mint.name)}>
                        <img className={styles.editIcon} src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
                      </button>
                      :
                      null
                    }
                  </div>
                  <p> {mint.record} </p>
                </div>)
            })}
          </div>
        </div>);
    }
  };

  // This will take us into edit mode and show us the edit buttons!
  const editRecord = (name) => {
    console.log("Editing record for", name);
    setEditing(true);
    setDomain(name);
  }


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

          {/* Display a logo and wallet connection status*/}
          {/* <div className={styles.right}> */}
          <img alt="Network logo" className={styles.logo} src={pattern.test(network) ? '/assets/polygonlogo.png' : "/assets/ethlogo.png"} />
          {currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p>}
          {/* </div> */}
        </div>

        {renderNotConnectedContainer()}
        {mints && renderMints()}



        <div className={styles.footerContainer}>
          <img alt="Twitter Logo" className={styles.twitterLogo} src="/assets/twitter-logo.svg" />
          <a
            className={styles.footerText}
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE} `}</a>
          &nbsp;
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
