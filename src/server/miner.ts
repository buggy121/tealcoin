import { workerData, parentPort } from 'worker_threads';
import { Blockchain } from './Blockchain';

interface Miner {
    walletAddress: string;
}

const tealCoin = new Blockchain();

const { walletAddress } = workerData as Miner;

while (true) {
    tealCoin.minePendingTransactions(walletAddress);
    parentPort && parentPort.postMessage('⛏ 💎');
}
