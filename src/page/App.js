import { useEffect, useState } from 'react';
import './App.css';
import contract from '../contracts/NFTCollectible.json';
import passAbi from '../contracts/pass.json'
import { ethers } from 'ethers';
import '../service/merkletree'
import verifyWhitelist from '../service/merkletree';
import Pass from '../component/pass'

const { ethereum } = window;
const contractAddress = "0xBf80418A2D7d8b730EF1D0F134ACc01275B9847E";
const passAddress = "0xB185411605cBF9FEE84B88eed133c4de0125633D";
const abi = contract.abi;
const pass = passAbi.abi;
const provider = new ethers.providers.Web3Provider(ethereum);
const signer = provider.getSigner();
const nftContract = new ethers.Contract(contractAddress, abi, signer);
const passContract = new ethers.Contract(passAddress, pass, signer)

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentMintStep, setMintStep] = useState(null)
  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      // console.log("Wallet exists! We're ready to go!")
    }
  }
  const connectWalletHandler = async () => {
    const { ethereum } = window;
    if (currentAccount) {
      setCurrentAccount(null);
      return
    }
    if (!ethereum) {
      alert("Please install Metamask!");
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);

      if (window.ethereum.chainId === '0xa869') {
        setCurrentAccount(accounts[0]);
        let mintStep = await nftContract.getMintStep();
        setMintStep(mintStep)

        let result = await verifyWhitelist("0x8d58995C2EB561Ca21c9bD7935015d739a75c5C0")
        //console.log(result.root)
      }
      else {
        console.log('worng chain id')
      }

      window.ethereum.on('chainchanged', function () {
        if (window.ethereum.chainId !== '0xa869') {
          console.log("Please make sure you are on Fuji", window.ethereum.chainId)
        }
      });
    } catch (err) {
      console.log(err)
    }
  }

  const passMint = async (realm) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        if (!currentAccount) {
          console.log('Please connect wallet')
          return
        }

        let nftTxn = await passContract.passMint(realm, { value: ethers.utils.parseEther("0.01") });
        await nftTxn.wait();

      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
  }

  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        if (!currentAccount) {
          console.log('Please connect wallet')
          return
        }
        const result = await verifyWhitelist(currentAccount);
        const proof = result.proof;
        const verified = result.verified
        if (!currentMintStep) return
        console.log(currentMintStep)
        if (currentMintStep === 1) {
          console.log(proof)
          if (!verified) {
            console.log("You are not a whitelist member")
            return
          }
          let nftTxn = await nftContract.presaleMint(proof, { value: ethers.utils.parseEther("0.01") });
          await nftTxn.wait();
        }
        else if (currentMintStep === 2) {
          let nftTxn = await nftContract.publicMint({ value: ethers.utils.parseEther("0.01") });
          await nftTxn.wait();
        }
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    window.ethereum.on('accountsChanged', function (accounts) {
      if (currentAccount) setCurrentAccount("");
      else {
        setCurrentAccount(accounts[0]);
      }
    });
    checkWalletIsConnected();
  }, [])
  return (
    <div className='main-app'>
      <div className='pass-container'>
        <Pass onClick={() => passMint(1)}>Quantum</Pass>
        <Pass onClick={() => passMint(2)}>Radioactive</Pass>
        <Pass onClick={() => passMint(3)}>Mecha</Pass>
        <Pass onClick={() => passMint(4)}>Digi</Pass>
        <Pass onClick={() => passMint(5)}>Cosmic</Pass>
      </div>

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