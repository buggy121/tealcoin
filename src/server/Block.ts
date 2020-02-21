import * as crypto from 'crypto';

import { Transaction } from './Transaction';

export class Block {
    private nonce: number;
    public hash: string;

    constructor(
        readonly timestamp: number,
        readonly transactions: Transaction[],
        public previousHash: string = ''
    ) {
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    public calculateHash(): string {
        return crypto.createHash('sha256').update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).digest('hex');
    }

    public mineBlock(difficulty: number): void {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }

    public hasValidTransactions(): boolean {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}
