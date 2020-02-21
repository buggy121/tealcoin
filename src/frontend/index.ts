import { ec as EC } from 'elliptic';
const crypto = new EC('secp256k1');

/*
    My Wallet
*/

const importPrivateKeyButton = document.getElementById('importPrivateKey') as HTMLButtonElement;
const publicKeyDiv = document.getElementById('myPublicKey') as HTMLDivElement;
const myBalanceDiv = document.getElementById('myBalance') as HTMLDivElement;
const refreshMyBalanceButton = document.getElementById('refreshMyBalance') as HTMLButtonElement;
const generatePrivateKeyButton = document.getElementById('generatePrivateKey') as HTMLButtonElement;

let myKey: EC.KeyPair | null = null;

importPrivateKeyButton.addEventListener('click', async () => {
    const privateKey = prompt('Private key: ', '');

    if (!privateKey) {
        publicKeyDiv.innerHTML = 'Wrong private key';
        return;
    }

    myKey = crypto.keyFromPrivate(privateKey);
    const publicKey = myKey.getPublic('hex');

    publicKeyDiv.innerHTML = publicKey;

    const balance = await fetchBalance(publicKey);
    myBalanceDiv.innerHTML = balance.toString();
});

refreshMyBalanceButton.addEventListener('click', async () => {
    if (!myKey) {
        return;
    }

    const balance = await fetchBalance(myKey.getPublic('hex'));

    myBalanceDiv.innerHTML = balance.toString();
});

generatePrivateKeyButton.addEventListener('click', () => {
    myKey = crypto.genKeyPair();

    prompt('Your new private key: ', myKey.getPrivate('hex'));

    publicKeyDiv.innerHTML = myKey.getPublic('hex');
    myBalanceDiv.innerHTML = '0';
});

/*
    Transfer
 */

const transferRecipientInput = document.getElementById('transferRecipient') as HTMLInputElement;
const transferAmountInput = document.getElementById('transferAmount') as HTMLInputElement;
const transferCoinsButton = document.getElementById('transferCoins') as HTMLButtonElement;

transferCoinsButton.addEventListener('click', () => {
    const recipient = transferRecipientInput.value;
    const amount = parseInt(transferAmountInput.value);

    if(!myKey) {
        alert('Import your private key first');
        return;
    }

    transferCoins(myKey.getPrivate('hex'), recipient, amount)
        .then(() => {
            transferAmountInput.value = '';
            transferRecipientInput.value = '';

            alert('Transfer disposition sent')
        })
        .catch((error) => {
            console.error(error);
        });
});

/*
    Balance
*/

const walletAddressInput = document.getElementById('walletAddress') as HTMLInputElement;
const getBalanceButton = document.getElementById('getBalance') as HTMLButtonElement;
const balanceDiv = document.getElementById('balance') as HTMLDivElement;

getBalanceButton.addEventListener('click', async () => {
    const walletAddress = walletAddressInput.value;
    const balance = await fetchBalance(walletAddress);

    balanceDiv.innerText = balance.toString();
});

async function fetchBalance(walletAddress: string): Promise<number> {
    const response: WalletResponse = await fetch(`/wallet/${walletAddress}`)
        .then(response => response.json());

    return response.balance;
}

function transferCoins(privateKey: string, recipientAddress: string, amount: number): Promise<Response> {
    const body = {
        privateKey,
        recipientAddress,
        amount
    };

    return fetch('/transfer', {
        method: 'POST',
        body: JSON.stringify(body)
    });
}

interface WalletResponse {
    balance: number;
}
