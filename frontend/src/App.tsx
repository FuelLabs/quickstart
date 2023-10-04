import { useIsConnected, useAccount, useConnect, useWallet } from "@fuel-wallet/react";
import { useEffect, useState } from "react";
import "./App.css";
// Import the contract factory -- you can find the name in index.ts.
// You can also do command + space and the compiler will suggest the correct name.
import { CounterContractAbi, CounterContractAbi__factory } from "./contracts";

// The address of the contract deployed the Fuel testnet
const CONTRACT_ID =
  "0xa0f2b97f32300d7360b5632e682c1508b326da9a00fbe755646d3809aec90672";

function App() {
  const { isConnected } = useIsConnected();
  const { connect } = useConnect();
  const { account } = useAccount();
  const { wallet } = useWallet({ address: account });
  const [counter, setCounter] = useState<number>(0);
  const [contract, setContract] = useState<CounterContractAbi | null>(null);

  useEffect(() => {
    if (isConnected) getCount()
  }, [isConnected, getCount])

  useEffect(() => {
    if (wallet) {
      const contractInstance = CounterContractAbi__factory.connect(CONTRACT_ID, wallet);
      setContract(contractInstance);
    }
  }, [wallet, setContract]);

  async function handleClick() {
    if (isConnected) {
      await increment();
    } else {
      await connect("");
    }
  }

  async function getCount() {
    if (wallet && contract) {
      try {
        const { value } = await contract.functions.count().simulate();
        setCounter(value.toNumber());
      } catch (error) {
        console.log("error getting state:", error);

      }
    }
  }

  async function increment() {
    if (wallet && contract) {
      try {
        await contract.functions.increment().txParams({ gasPrice: 1 }).call();
        getCount();
      } catch (error) {
        console.log("error sending transaction: ", error);
      }
    }
  }

  return (
    <>
      <div className="App">
        <h3>Counter: {counter}</h3>
        <button onClick={handleClick}>
          {isConnected ? "Increment" : "Connect"}
        </button>
      </div>
    </>
  );
}

export default App;