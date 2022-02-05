import './App.css';
import React from 'react';
import { useEffect, useState } from "react";
import { ethers } from 'ethers';
import contractABI from './utils/NFTCollectible.json';
import a from './assets/01.png';
import b from './assets/02.png';
import c from './assets/03.png';
import e from './assets/04.png';
import f from './assets/05.png';
import g from './assets/06.png';
import h from './assets/07.png';
import i from './assets/08.png';
import j from './assets/09.png';
import k from './assets/10.png';
import l from './assets/11.png';
import m from './assets/12.png';
import n from './assets/13.png';
import o from './assets/14.png';
import p from './assets/15.png';
import q from './assets/16.png';
import r from './assets/17.png';
// import Me from './assets/Me.jpg';

const contractAddress = '0xe1e0fF469690d7c5798EA98f83f6AA2afdF54891';
const abi = contractABI.abi;
const RARIBLE_LINK = `https://rinkeby.rarible.com/collection/${contractAddress}/items`;

function App() {
  const [network, setNetwork] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isMintingNFT, setIsMintingNFT] = useState(false);
  const images = [a, b, c, e, f, g, h, i, j, k, l, m, n, o, p, q, r];
  let array = Array.apply(null, Array(100)).map(() => "");

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have Metamask installed!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);

        //check to make sure on the right checkNetwork
        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Connected to chain " + chainId);
        // Hex code of the chainId of the Rinkeby test network
        const rinkebyChainId = "0x4";
        if (chainId === rinkebyChainId) {
          setNetwork("Rinkeby")
        }

        //get account 
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  //HANDLERS
  const connectWalletHandler = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please download MetaMask to use this dapp");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const mintNFTHandler = async () => {
    setIsMintingNFT(true);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await nftContract.mintNFTs(1, { gasLimit: 5000000 });
        console.log("Minting... please wait")
        await nftTxn.wait();
        console.log('NFT minted');
        setIsMintingNFT(false);
      } else {
        console.log('Ethereum object does not exist');
      }
    } catch (err) {
      setIsMintingNFT(false);
      console.log(err);
    }
  }

  // Set up the listener
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(contractAddress, abi, signer);

        connectedContract.on("NewNFTMinted", (from, tokenId) => {
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a few minutes show up on Rarible. Here's the link: https://rinkeby.rarible.com/token/${contractAddress}:${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  //render methods
  //maps over blank array and returns a random image 
  const renderBackground = () => {
    return (
      array.map((item, key) => <img alt="Preview NFT" key={key} className="preview-nft" src={images[Math.floor(Math.random() * images.length)]} />)
    )
  }

  const renderButtonOrRinkebyWarning = () => {
    if (!currentAccount) {
      return (
        <button onClick={connectWalletHandler} className='cta-button'>
          Connect Wallet
        </button>
      )
    }

    if (currentAccount && network === "Rinkeby") {
      return (
        <button disabled={isMintingNFT} onClick={mintNFTHandler} className='cta-button'>
          {!isMintingNFT ? 'Mint Your Lines' : 'Minting.... Please confirm the transaction.'}
        </button>
      )
    }

    if (currentAccount && network === "") {
      return <div className="rinkeby-only">
        <p>This dapp only works on the Rinkeby Test Network. To mint an NFT, please switch networks in your connected wallet.</p>
      </div>
    }
  }

  const renderLoader = () => {
    if (isMintingNFT) {
      return (
        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      )
    }
  }

  const renderRaribleButton = () => {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          window.location.href = RARIBLE_LINK;
        }}
        className="rarible-button"
      >🌊 Check out the collection on Rarible 🌊</button>
    )
  }

  // USE EFFECTS

  useEffect(() => {
    checkIfWalletIsConnected();
    setupEventListener();
  }, []);

  //listen for chain and account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      })

      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })
    }
  })

  return (
    <div className='main-app'>
      <div className="gallery-container">
        {renderBackground()}
      </div>
      <div className="floating">
        {renderButtonOrRinkebyWarning()}
        <div className='view-collection'>
          {renderRaribleButton()}
        </div>
        <div className='loader'>
          {renderLoader()}
        </div>
      </div>
      {/* <div className="footer-container">
        <a
          href={'https://www.mattmiller.app/'}
          target="_blank"
          rel="noreferrer"
        ><img alt="My avatar" className="my-avatar" src={Me} /><p>Built By Matt</p></a>
      </div> */}
    </div>

  );
}
export default App;