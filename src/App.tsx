import { FormEvent, useCallback, useEffect, useState } from "react";
import { Asset, BASE_FEE, Horizon, Networks, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { getAddress, isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const networkPassphrase = Networks.TESTNET;
const explorer = "https://stellar.expert/explorer/testnet/tx";
const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-6)}`;

export default function App() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("Connect Freighter to get started.");
  const [transactionHash, setTransactionHash] = useState("");
  const [busy, setBusy] = useState(false);

  const loadBalance = useCallback(async (accountAddress: string) => {
    const account = await server.loadAccount(accountAddress);
    const native = account.balances.find((entry) => entry.asset_type === "native");
    setBalance(native && "balance" in native ? native.balance : "0");
  }, []);

  const connect = async () => {
    setBusy(true); setMessage("Waiting for Freighter approval…");
    try {
      const connection = await isConnected();
      if (!connection.isConnected) throw new Error("Install the Freighter wallet extension first.");
      await requestAccess();
      const result = await getAddress();
      if (result.error || !result.address) throw new Error(result.error ?? "Could not read the wallet address.");
      setAddress(result.address); await loadBalance(result.address); setMessage("Wallet connected to Stellar Testnet.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not connect to Freighter."); }
    finally { setBusy(false); }
  };
  const disconnect = () => { setAddress(""); setBalance(null); setMessage("Wallet disconnected."); };
  useEffect(() => { if (address) void loadBalance(address); }, [address, loadBalance]);

  const sendPayment = async (event: FormEvent) => {
    event.preventDefault(); setTransactionHash("");
    if (!address) return setMessage("Connect a wallet before sending a payment.");
    if (!destination || !amount || Number(amount) <= 0) return setMessage("Enter a valid destination and amount.");
    setBusy(true); setMessage("Preparing your transaction…");
    try {
      const account = await server.loadAccount(address);
      const transaction = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase })
        .addOperation(Operation.payment({ destination, asset: Asset.native(), amount: Number(amount).toFixed(7) }))
        .setTimeout(180).build();
      setMessage("Approve the transaction in Freighter…");
      const signed = await signTransaction(transaction.toXDR(), { networkPassphrase });
      const response = await server.submitTransaction(TransactionBuilder.fromXDR(signed.signedTxXdr, networkPassphrase));
      setTransactionHash(response.hash); setMessage("Payment confirmed on Stellar Testnet."); await loadBalance(address); setDestination(""); setAmount("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "The transaction failed."); }
    finally { setBusy(false); }
  };

  return <main className="shell">
    <section className="hero"><div className="eyebrow">STELLAR TESTNET · WHITE BELT</div><h1>Send value,<br /><span>without the noise.</span></h1><p className="lede">A tiny payment dApp for learning the fundamentals of wallets, balances, and on-chain transactions.</p><div className="network-pill"><span className="dot" /> Connected to Stellar Testnet</div></section>
    <section className="card wallet-card"><div className="card-heading"><div><p className="label">YOUR WALLET</p><h2>{address ? shortAddress(address) : "Not connected"}</h2></div><div className="wallet-mark">✦</div></div><div className="balance"><span>Available balance</span><strong>{balance ? `${Number(balance).toFixed(2)} XLM` : "—"}</strong></div><div className="actions">{address ? <button className="secondary" onClick={disconnect}>Disconnect</button> : <button className="primary" onClick={connect} disabled={busy}>{busy ? "Connecting…" : "Connect Freighter"}</button>}</div></section>
    <section className="card payment-card"><div className="card-heading"><div><p className="label">NEW PAYMENT</p><h2>Send XLM</h2></div><span className="step">01 / 01</span></div><form onSubmit={sendPayment}><label>Recipient address<input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="G…" spellCheck="false" /></label><label>Amount<input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" inputMode="decimal" /><small>XLM · Stellar testnet</small></label><button className="primary full" disabled={busy}>{busy ? "Processing…" : "Review & send"}<span>↗</span></button></form><div className="status" role="status"><span className="status-dot" />{message}</div>{transactionHash && <a className="hash" href={`${explorer}/${transactionHash}`} target="_blank" rel="noreferrer">View transaction on Stellar Expert ↗</a>}</section>
    <footer><span>Built for the Stellar White Belt challenge.</span><span>Testnet only · No real funds</span></footer>
  </main>;
}
