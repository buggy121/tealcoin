import * as Koa from 'koa';
import { Worker } from 'worker_threads';
import { ec as EC } from 'elliptic';
import * as path from 'path';

import { Blockchain } from './Blockchain';

const ec = new EC('secp256k1');

// Your private key goes here
const myKey = ec.keyFromPrivate('13a5631c286c97f0a4441619ca32e593f384f616f3993415b44a447f49c783a3');

// From that we can calculate your public key (which doubles as your wallet address)
const myWalletAddress = myKey.getPublic('hex');

const worker = new Worker(path.join(__dirname, 'miner.js'), { workerData: { walletAddress: myWalletAddress } });
worker.on('message', console.log);
worker.on('error', console.log);
worker.on('exit', console.log);

const FRONTEND_PORT = 3000;

const frontendServer = new Koa();

frontendServer.use(async ctx => {
    const tealCoin = new Blockchain();
    ctx.body = `Hello ${myWalletAddress}, your balance: ${tealCoin.getBalanceOfAddress(myWalletAddress)}`;
});


frontendServer.listen(FRONTEND_PORT);
console.log(`Frontend server started on port ${FRONTEND_PORT}`);

