import * as fs from 'fs';
import * as path from 'path';

import { Block } from './Block';
import { Transaction } from './Transaction';

export class Blockchain {
  private readonly chain: Block[];
  private difficulty: number;
  private pendingTransactions: Transaction[];
  private miningReward: number;

  static PERSISTENT_FILE = '../../blockchain.json';

  constructor() {
    this.difficulty = 5;
    this.miningReward = 100;

    try {
      const data = JSON.parse(fs.readFileSync(path.join(__dirname, Blockchain.PERSISTENT_FILE), 'utf-8'));

      this.chain = data.chain;
      this.pendingTransactions = data.pendingTransactions;
    } catch (e) {
      this.chain = [this.createGenesisBlock()];
      this.pendingTransactions = [];
      this.saveToFile();
    }
  }

  private saveToFile(): void {
    const data = JSON.stringify({
      chain: this.chain,
      pendingTransactions: this.pendingTransactions
    });

    fs.writeFileSync(path.join(__dirname, Blockchain.PERSISTENT_FILE), data);
  }

  private createGenesisBlock(): Block {
    return new Block(Date.parse('2017-01-01'), [], '0');
  }

  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  public minePendingTransactions(miningRewardAddress: string): void {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    this.chain.push(block);

    this.pendingTransactions = [];
    this.saveToFile();
  }

  public addTransaction(transaction: Transaction): void {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }

    // Verify the transactiion
    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    if (transaction.amount <= 0) {
      throw new Error('Transaction amount should be higher than 0');
    }

    // Making sure that the amount sent is not greater than existing balance
    if (this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
      throw new Error('Not enough balance');
    }

    this.pendingTransactions.push(transaction);
    this.saveToFile();
  }

  public getBalanceOfAddress(address: string): number {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  public getAllTransactionsForWallet(address: string): Transaction[] {
    const txs = [];

    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.fromAddress === address || tx.toAddress === address) {
          txs.push(tx);
        }
      }
    }

    return txs;
  }

  public isChainValid(): boolean {
    // Check if the Genesis block hasn't been tampered with by comparing
    // the output of createGenesisBlock with the first block on our chain
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.chain[0])) {
      return false;
    }

    // Check the remaining blocks on the chain to see if there hashes and
    // signatures are correct
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
    }

    return true;
  }
}
