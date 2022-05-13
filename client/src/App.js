import React, { useEffect, useState } from 'react';
import './App.css';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';

import idl from './idl.json';
import kp from './keypair.json'

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

// Create a keypair for the account that will hold the data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [indexData, setIndexData] = useState('');
  const [index, setIndex] = useState('');
  const [tupList, setTupList] = useState([]);
  const [tup, setTup] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );

          /*
           * Set the user's publicKey in state to be used later!
           */
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const onIndexChange = (event) => {
    const { value } = event.target;
    setIndexData(value);
    setIndex(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const createTupAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getTupList();
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  const sendTup = async () => {
    if (inputValue.length === 0) {
      console.log("Enter 2 numbers separated by ','!")
      return
    }
    setInputValue('');
    console.log('Numbers:', inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
  
      await program.rpc.addTup(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("Numbers successfully sent to program", inputValue)
  
      await getTupList();
    } catch (error) {
      console.log("Error sending numbers:", error)
    }
  };

  const sendIndex = async () => {
    if (indexData.length === 0) {
      console.log("Enter index!")
      return
    }
    setIndexData('');
    console.log('Index:', indexData);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
  
      await program.rpc.getTup(indexData, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("Index successfully sent to program", indexData)
  
      await getIndexList();
    } catch (error) {
      console.log("Error sending index:", error)
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => {
    // If we hit this, it means the program account hasn't been initialized.
      if (tupList === null) {
        return (
          <div className="connected-container">
            <button className="cta-button submit-tup-button" onClick={createTupAccount}>
              Do One-Time Initialization
            </button>
          </div>
        )
      } 
      // Otherwise, we're good! Account exists. User can submit numbers.
      else {
        return(
          <div className="connected-container">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendTup();
              }}
            >
              <input
                type="text"
                placeholder="Enter 2 numbers separated by ','!"
                value={inputValue}
                onChange={onInputChange}
              />
              <button type="submit" className="cta-button submit-tup-button">
                Submit
              </button>
            </form>
            <div className="">
              {tupList.map((item, index) => (
                <p className="tup-item" key={index}>
                  {item}
                </p>
              ))}
            </div>


            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendIndex();
              }}
            >
              <input
                type="text"
                placeholder="Enter index!"
                value={indexData}
                onChange={onIndexChange}
              />
              <button type="submit" className="cta-button submit-tup-button">
                Submit
              </button>
            </form>
            <div className="tup-grid">
              {tup.map((item, i) => (
                <p className="tup-item" key={i}>
                  The {index}th largest element is {item}
                </p>
              ))}
            </div>
          </div>
        )
      }
    }

  // UseEffects
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  
  const getTupList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("Got the account", account)
      setTupList(account.tupList)
  
    } catch (error) {
      console.log("Error in getTupList: ", error)
      setTupList(null);
    }
  }

  const getIndexList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("Got the account", account)
      setTup(account.zanga)
  
    } catch (error) {
      console.log("Error in zanga: ", error)
      setTup(null);
    }
  }
  
  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching tup_list...');
      getTupList()
    }
  }, [walletAddress]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">TOP TUPLE</p>
          {!walletAddress && renderNotConnectedContainer()}
          {/* We just need to add the inverse here! */}
          {walletAddress && renderConnectedContainer()}
        </div>
      </div>
    </div>
  );
};

export default App;
