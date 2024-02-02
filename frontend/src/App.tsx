import { useEffect, useState } from "react";
import {
  useConnectUI,
  useIsConnected,
  useWallet,
} from '@fuel-wallet/react';
// Import the contract factory -- you can find the name in src/sway-api/contracts/index.ts.
// You can also do command + space and the compiler will suggest the correct name.
import { CounterContractAbi__factory  } from "./sway-api"
import type { CounterContractAbi } from "./sway-api";

// The address of the contract deployed the Fuel testnet
const CONTRACT_ID = 
  "0x78218d62429082ccf3f6a8a36155aaf771508c632c0855f8fe2d51d6f7baec73";

export default function Home() {
  const [contract, setContract] = useState<CounterContractAbi>();
  const [counter, setCounter] = useState<number>();
  const { connect, setTheme, isConnecting } =
    useConnectUI();
  const { isConnected } = useIsConnected();
  const { wallet } = useWallet();

  setTheme("dark");

  useEffect(() => {
    async function getInitialCount(){
      if(isConnected && wallet){
        const counterContract = CounterContractAbi__factory.connect(CONTRACT_ID, wallet);
        await getCount(counterContract);
        setContract(counterContract);
      }
    }
    
    getInitialCount();
  }, [isConnected, wallet]);

  const getCount = async (counterContract: CounterContractAbi) => {
    try{
      const { value } = await counterContract.functions
      .count()
      .txParams({
        gasPrice: 1,
        gasLimit: 100_000,
      })
      .simulate();
      setCounter(value.toNumber());
    } catch(error) {
      console.error(error);
    }
  }

  const onIncrementPressed = async () => {
    if (!contract) {
      return alert("Contract not loaded");
    }
    // Creates a transactions to call the increment function
    // because it creates a TX and updates the contract state
    // this requires the wallet to have enough coins to cover the costs and also to sign the Transaction
    try {
      await contract.functions
      .increment()
      .txParams({
        gasPrice: 1,
        gasLimit: 100_000,
      })
      .call();
      await getCount(contract);
    } catch(error) {
      console.error(error);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        {isConnected ? (
          <>
            <h3 style={styles.label}>Counter</h3>
            <div style={styles.counter}>
              {counter ?? 0}
            </div>
            <button
            onClick={onIncrementPressed}
            style={styles.button}
            >
              Increment Counter
            </button>
          </>
        ) : (
          <button
          onClick={() => {
            connect();
          }}
          style={styles.button}
          >
            {isConnecting ? 'Connecting' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: 'grid',
    placeItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: "black",
  } as React.CSSProperties,
  container: {
    color: "#ffffffec",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  } as React.CSSProperties,
  label: {
    fontSize: "28px",
  },
  counter: {
    color: "#a0a0a0",
    fontSize: "48px",
  },
  button: {
    borderRadius: "8px",
    marginTop: "24px",
    backgroundColor: "#707070",
    fontSize: "16px",
    color: "#ffffffec",
    border: "none",
    outline: "none",
    height: "60px",
    padding: "0 1rem",
    cursor: "pointer"
  },
}