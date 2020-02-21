interface WalletResponse {
    balance: number;
}

const walletAddressInput = document.getElementById('walletAddress') as HTMLInputElement;
const getBalanceButton = document.getElementById('getBalance') as HTMLButtonElement;
const balanceDiv = document.getElementById('balance') as HTMLDivElement;

getBalanceButton.addEventListener('click', () => {
    const walletAddress = walletAddressInput.value;

    fetch(`/wallet/${walletAddress}`)
        .then((response) => {
            return response.json();
        })
        .then((response: WalletResponse) => {
            balanceDiv.innerText = `Balance: ${response.balance}`;
        });
});
