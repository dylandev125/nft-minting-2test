import { useEffect, useState } from 'react';
import './App.css';
import contract from '../contracts/NFTCollectible.json';
import { ethers } from 'ethers';
import '../service/merkletree'
import verifyWhitelist from '../service/merkletree';
const { ethereum } = window;
const contractAddress = "0x02389e2a13f82cFfa65f942FD1b459B264Ac34e2";
const abi = contract.abi;
const provider = new ethers.providers.Web3Provider(ethereum);
const signer = provider.getSigner();
const nftContract = new ethers.Contract(contractAddress, abi, signer);
function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentMintStep, setMintStep] = useState(null)
  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!")
    }
  }
  const connectWalletHandler = async () => {
    const { ethereum } = window;
    if(currentAccount) {
      setCurrentAccount(null);
      return
    }
    if (!ethereum) {
      alert("Please install Metamask!");
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      console.log(window.ethereum.chainId)
      if(window.ethereum.chainId === '0xa869') {
        setCurrentAccount(accounts[0]);
        let mintStep = await nftContract.getMintStep();
        setMintStep(mintStep)
      }
      else {
        console.log('worng chain id')
      }
      window.ethereum.on('accountsChanged', function (accounts) {
        if(currentAccount) setCurrentAccount("");
        else {
          setCurrentAccount(accounts[0]);
        }
      });
      window.ethereum.on('chainchanged', function () {
        if(window.ethereum.chainId !== '0xa869') {
          console.log("Please make sure you are on Fuji", window.ethereum.chainId)
        }
      });
    } catch (err) {
      console.log(err)
    }
  }
  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        if(!currentAccount) {
          console.log('Please connect wallet')
          return
        }
        const result = await verifyWhitelist(currentAccount);
        const proof = result.proof;
        const verified = result.verified
        if(!currentMintStep) return
        if(currentMintStep === 1) {
          if(!verified) {
            console.log("You are not a whitelist member")
            return
          }
          let nftTxn = await nftContract.presaleMint({ value: ethers.utils.parseEther("0.01") }, proof);
          console.log("Mining... please wait");
          await nftTxn.wait();
        }
        else if (currentMintStep === 2) {
          let nftTxn = await nftContract.publicMint({ value: ethers.utils.parseEther("0.01") });
          console.log("Mining... please wait");
          console.log('')
          await nftTxn.wait();
        }
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
  }
  useEffect( () => {
    checkWalletIsConnected();
  }, [])
  return (
    <div className='main-app'>
      <h1>Mint Test</h1>
      <div className='btnGroup'>
        <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
          {currentAccount ? 'Disconnect  Wallet' : 'Connect Wallet'}
        </button>
        <button onClick={mintNftHandler} className='cta-button mint-nft-button'>
          Mint NFT
        </button>
      </div>
      <h2>{currentAccount}</h2>
    </div>
  )
}
export default App;