# BlockBank DEX (Decentralized Exchange)

**BlockBank DEX** is a modern, high-performance, and user-friendly decentralized exchange built on the **Sepolia Testnet**. It enables users to swap tokens (**BBUSD** & **BBETH**) seamlessly with a professional interface, integrated portfolio management, and on-chain faucet functionality.

![Project Screenshot](https://raw.githubusercontent.com/placeholder-image.png)
*(Note: Upload a screenshot of your swap interface here)*

## 🚀 Features

### 🔄 Modern Swap Interface
-   **Seamless Swapping**: Swap between **BlockbankUSD (BBUSD)** and **BlockbankETH (BBETH)** instantly.
-   **Dynamic Pricing**: Real-time price feeds via **Chainlink Oracles** (Sepolia ETH/USD).
-   **0.1% Swap Fee**: A dynamic fee mechanism that accumulates value in the contract (configurable by owner).
-   **Smart Interaction**:
    -   Auto-approval checks (Approve -> Swap flow).
    -   Slippage protection settings.
    -   Visual feedback for transactions (Spinning arrows, scale effects).

### 🏦 Portfolio & Wallet
-   **Integrated Portfolio**: View your Net Worth, Asset Distribution (Pie Chart), and individual token balances.
-   **Testnet Faucet**: Built-in "Faucet" buttons to mint free test tokens (1000 BBUSD / 1000 BBETH) directly to your wallet.
-   **Add to Wallet**: One-click integration to add custom tokens to MetaMask.
-   **Wallet Support**: Full support for **MetaMask**, **Rainbow**, **Trust Wallet**, and others via **WalletConnect**.

### 📜 Transaction History
-   **Local History**: Tracks your recent swaps with status indicators and Etherscan links.
-   **Persisted Data**: Saves transaction details locally so you never lose track of your activity.

---

## 🛠 Technology Stack

This project uses the latest modern web3 technologies:

-   **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
-   **Web3 Integration**: [Wagmi v2](https://wagmi.sh/), [Viem](https://viem.sh/)
-   **Wallet Connection**: [RainbowKit](https://www.rainbowkit.com/)
-   **Styling**: [TailwindCSS v4](https://tailwindcss.com/), [Clsx](https://github.com/lukeed/clsx)
-   **Charts**: [Recharts](https://recharts.org/)
-   **Smart Contracts**: Solidity ^0.8.20 (OpenZeppelin Standards)

---

## 🔗 Deployed Contracts (Sepolia)

| Contract | Address | Description |
| :--- | :--- | :--- |
| **Swap Contract** | `0x1113997E5491012dF8BD1402C8e67465905cB3C7` | Main exchange logic & liquidity pool |
| **BlockbankUSD** | `0x7297075a92D2b3144119889ef4f991726A3afFE4` | Stablecoin (6 decimals) |
| **BlockbankETH** | `0xaDcCCF2eA5bF1069FC14c01505c928d357b171ee` | Synthetic ETH (18 decimals) |
| **Chainlink Feed** | `0x694AA1769357215DE4FAC081bf1f309aDC325306` | ETH/USD Price Oracle |

---

## 📦 Getting Started

### Prerequisites
-   Node.js 18+ installed.
-   MetaMask Wallet installed in browser.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/enverkorkmaz/blockbankdex.git
    cd blockbankdex
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in Browser:**
    Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📄 Smart Contracts

The project includes custom smart contracts located in the `contracts/` folder:

*   **BlockbankSwap.sol**:
    *   Implements `swapBbusdToBbeth` and `swapBbethToBbusd`.
    *   Dynamic Fee (0.1%) logic.
    *   `depositLiquidity` / `withdrawLiquidity` for owner management.
    *   Security: `ReentrancyGuard`, `Pausable`, `Ownable`.
*   **BlockbankUSD.sol**: ERC20 Token with `faucet()` function.
*   **BlockBankETH.sol**: ERC20 Token with `faucet()` function.

---

## 🛡 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ for the Decentralized Web.**
