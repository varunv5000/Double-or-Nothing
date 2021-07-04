require('dotenv').config();
const BN = require('bn.js');
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey); 

const contractABI = require("../contract-abi.json");
const contractAddress = "0x801e0d41690455451afF0d37fE57331ed98d9eBf";
export const gamblingContract = new web3.eth.Contract(
    contractABI,
    contractAddress
  );

export const loadCurrentMessage = async () => { 
    const retrieve = await gamblingContract.methods.retrieve().call(); 
    return web3.utils.fromWei(retrieve.toString(), "ether");;
};

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
          const addressArray = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const obj = {
            status: "👆🏽 Write an input in the text-field above.",
            address: addressArray[0],
          };
          return obj;
        } catch (err) {
          return {
            address: "",
            status: "😥 " + err.message,
          };
        }
      } else {
        return {
          address: "",
          status: (
            <span>
              <p>
                {" "}
                🦊{" "}
                <a target="_blank" href={`https://metamask.io/download.html`}>
                  You must install Metamask, a virtual Ethereum wallet, in your
                  browser.
                </a>
              </p>
            </span>
          ),
        };
      }
  
};

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
          const addressArray = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (addressArray.length > 0) {
            return {
              address: addressArray[0],
              status: "👆🏽 Write an input in the text-field above.",
            };
          } else {
            return {
              address: "",
              status: "🦊 Connect to Metamask using the top right button.",
            };
          }
        } catch (err) {
          return {
            address: "",
            status: "😥 " + err.message,
          };
        }
      } else {
        return {
          address: "",
          status: (
            <span>
              <p>
                {" "}
                🦊{" "}
                <a target="_blank" href={`https://metamask.io/download.html`}>
                  You must install Metamask, a virtual Ethereum wallet, in your
                  browser.
                </a>
              </p>
            </span>
          ),
        };
      }
  
};

export const gamble = async (address, amount) => {
    if (!window.ethereum || address === null) {
        return {
          status:
            "💡 Connect your Metamask wallet to gamble!",
        };
      }
    
      if (amount.trim() === "") {
        return {
          status: "❌ Your message cannot be an empty string.",
        };
      }
      let toHex = web3.utils.toWei(amount,"ether");
      toHex = Number(toHex).toString(16);

      const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: address, // must match user's active address.
        value: toHex,
        data: gamblingContract.methods.gamble().encodeABI(),
 
      };
    
    //sign the transaction
      try {
        const txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [transactionParameters],
        });
        return {
          status: (
            <span>
              ✅{" "}
              <a target="_blank" href={`https://ropsten.etherscan.io/tx/${txHash}`}>
                View the status of your transaction on Etherscan!
              </a>
              <br />
              ℹ️ Once the transaction is verified by the network, the message will
              be updated automatically.
            </span>
          ),
        };
      } catch (error) {
        return {
            status: "😥 " + error.message,
        };
    }
};
