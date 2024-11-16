import * as anchor from "@coral-xyz/anchor";
import fs from "fs";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { PROGRAM_ID } from "../lib/constant";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

import {
  createInitializeTx,
  createLockCorenftTx,
  createUnlockCorenftTx,
} from "../lib/scripts";

import idl from '../target/idl/mpl_corenft_pnft_staking.json';
import { MplCorenftPnftStaking } from '../target/types/mpl_corenft_pnft_staking';

const IDL: MplCorenftPnftStaking = idl as MplCorenftPnftStaking;

let solConnection: Connection = null;
let program: anchor.Program = null;
let provider: anchor.Provider = null;
let payer: NodeWallet = null;

// Address of the deployed program.
let programId = new anchor.web3.PublicKey(PROGRAM_ID);

/**
 * Set cluster, provider, program
 * If rpc != null use rpc, otherwise use cluster param
 * @param cluster - cluster ex. mainnet-beta, devnet ...
 * @param keypair - wallet keypair
 * @param rpc - rpc
 */
export const setClusterConfig = async (
  cluster: anchor.web3.Cluster,
  keypair: string,
  rpc?: string
) => {
  if (!rpc) {
    solConnection = new anchor.web3.Connection(anchor.web3.clusterApiUrl(cluster));
  } else {
    solConnection = new anchor.web3.Connection(rpc);
  }

  const walletKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(keypair, "utf-8"))),
    { skipValidation: true }
  );
  
  const wallet = new NodeWallet(walletKeypair);

  // Configure the client to use the local cluster.
  anchor.setProvider(
    new anchor.AnchorProvider(solConnection, wallet, {
      skipPreflight: false,
      commitment: "confirmed",
    })
  );
  payer = wallet;

  provider = anchor.getProvider();
  console.log("Wallet Address: ", wallet.publicKey.toBase58());

  // Generate the program client from IDL.
  console.log("Program ID: ", programId);
  program = new anchor.Program(IDL as anchor.Idl, provider);

};

/**
 * Initialize global pool, vault
 */
export const initProject = async () => {
  try {
    const updateCpIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 5_000_000,
    });
    const updateCuIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 200_000,
    });

    const tx = new Transaction().add(
      updateCpIx,
      updateCuIx,
      await createInitializeTx(payer.publicKey, program)
    );
    const { blockhash, lastValidBlockHeight } =
      await solConnection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer.publicKey;

    console.dir(tx, { depth: null });

    console.log(provider.publicKey.toBase58());

    console.log(await solConnection.simulateTransaction(tx, [payer.payer]))
    const txId = await solConnection.sendTransaction(tx, [payer.payer], {
      preflightCommitment: "confirmed",
    });

    console.log("txHash: ", txId);
  } catch (e) {
    console.log("error!!!!!!!!!");
    console.log(e);
  }
};

export const lockCorenft = async (asset: string, keypair: string) => {
  try {
    const tx = await createLockCorenftTx(
      payer as anchor.Wallet,
      asset,
      program,
      solConnection,
      keypair
    );

    await addAdminSignAndConfirm(tx);

  } catch (e) {
    console.log(e);
  }
};

export const unlockCorenft = async (asset: string, owner: PublicKey, keypair: string) => {
  try {
    const tx = await createUnlockCorenftTx(
      payer as anchor.Wallet,
      asset,
      program,
      solConnection,
      keypair,
      owner
    );

    await addAdminSignAndConfirm(tx);
  } catch (e) {
    console.log(e);
  }
};


export const addAdminSignAndConfirm = async (txData: Buffer) => {
  // Deserialize the transaction
  let tx = Transaction.from(txData);

  // Sign the transaction with admin's Keypair
  // tx = await adminWallet.signTransaction(tx);
  // console.log("signed admin: ", adminWallet.publicKey.toBase58());

  const sTx = tx.serialize();

  // Send the raw transaction
  const options = {
    commitment: 'confirmed',
    skipPreflight: false,
  };
  // Confirm the transaction
  const signature = await solConnection.sendRawTransaction(sTx, options);
  await solConnection.confirmTransaction(signature, 'confirmed');

  console.log('Transaction confirmed:', signature);
};
