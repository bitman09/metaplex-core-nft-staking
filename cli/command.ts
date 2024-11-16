import { program } from 'commander';
import { PublicKey } from '@solana/web3.js';
import {
  lockCorenft,
  unlockCorenft,
  setClusterConfig,
} from './scripts';

// program.version('0.0.1');

programCommand('init')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);
    console.log('pass clusterconfig!!!!!!!!');

    await initProject();
  });

programCommand('lock')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .option('-t, --nftType <string>')
  .option('-m, --mint <string>')
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, mint } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);
    if (mint === undefined) {
      console.log('Error token amount Input');
      return;
    }

    switch(nftType) {
      case "Corenft": {
        await await lockCorenft(mint, keypair);
        break;
      }
      default: {
        console.log('Nft Type is invalid');
        return;
      }
    }

    
  });

programCommand('unlock')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .option('-t, --nftType <string>')
  .option('-m, --mint <string>')
  .option('-o, --owner <string>') // nft owner address if force unstaking from admin
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, mint, owner } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);
    if (mint === undefined) {
      console.log('Error token amount Input');
      return;
    }

    switch(nftType) {
      case "Corenft": {
        await unlockCorenft( mint, !owner ? undefined : new PublicKey(owner), keypair);
        break;
      }
      default: {
        console.log('Mission Type is invalid');
        return;
      }
    }
  });

function programCommand(name: string) {
  return (
    program
      .command(name)
      .option('-e, --env <string>', 'Solana cluster env name', 'devnet') //mainnet-beta, testnet, devnet
      .option(
        '-r, --rpc <string>',
        'Solana cluster RPC name',
        'your rpc url'
      )
      .option(
        '-k, --keypair <string>',
        'Solana wallet Keypair Path',
        'your keypair url'
      )
  );
}

program.parse(process.argv);
