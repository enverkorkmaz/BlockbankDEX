# 🏦 BlockBank DEX: Professional Decentralized Exchange

[![Smart Contract](https://img.shields.io/badge/Solidity-0.8.20-blue.svg)](https://soliditylang.org/)
[![Modern Frontend](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Web3 Stack](https://img.shields.io/badge/Wagmi-v2-orange.svg)](https://wagmi.sh/)
[![Network](https://img.shields.io/badge/Network-Sepolia_Testnet-yellow.svg)](https://sepolia.etherscan.io/)

<<<<<<< HEAD
**BlockBank DEX** is an enterprise-grade, full-stack decentralized exchange platform deployed on the Ethereum Sepolia Testnet. It features a sleek, high-performance user interface, secure smart contracts with Oracle integration, and a comprehensive portfolio management system.
=======

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
>>>>>>> 450966a85a41dcae1217b4d422ffa891d9636a82

---

## 📸 Interface Preview

*(Upload your professional screenshots to the `/public` folder and link them here)*
> **Experience the precision of modern Web3 design with glassmorphism, real-time price feeds, and tactile interactions.**

---

## ✨ Key Features

### 1. 🔄 Advanced Swap Engine
*   **Token Pairs**: Seamlessly swap between `BlockbankUSD (BBUSD)` (Stablecoin) and `BlockbankETH (BBETH)` (Synthetic ETH).
*   **Oracle Integration**: Real-time pricing via **Chainlink V3 Aggregators** ensures fair market value swaps.
*   **Slippage Control**: User-defined slippage tolerance (0.5%, 1.0%, etc.) to protect against front-running and volatile price shifts.
*   **Fast Approvals**: Intelligent UI that detects allowance and guides users through the `Approve -> Swap` flow.

### 2. 📊 Portfolio & Wealth Management
*   **Asset Visualization**: Interactive Pie Charts (`Recharts`) showing asset distribution across BBUSD, BBETH, and Native Sepolia ETH.
*   **Net Worth Tracking**: Real-time valuation of all assets in USD based on live Oracle data.
*   **Token Utilities**:
    *   **Faucet**: Built-in testnet tokens for developers and testers (1000 tokens per click).
    *   **Add to Wallet**: One-click `wallet_watchAsset` integration to add tokens to MetaMask automatically.

### 3. 🛡 Security & Fairness
*   **0.1% Dynamic Fee**: Sustainable revenue model where a small fee is collected per swap (owner-configurable).
*   **Non-Reentrant**: All swap functions are protected by OpenZeppelin's `ReentrancyGuard`.
*   **Emergency Protection**: Contract owner can pause the DEX in case of anomalies.
*   **Liquidity Management**: Transparent `depositLiquidity` and `withdrawLiquidity` functions for pool operators.

---

## 🏗 System Architecture

### Frontend Layer
- **Framework**: Next.js 15 (App Router) for superior SEO and performance.
- **Provider Stack**: Wagmi v2 + TanStack Query for robust blockchain state management.
- **Wallet UI**: RainbowKit for a premium, multi-wallet connection experience.
- **Styling**: TailwindCSS v4 with custom glassmorphism and animations.
- **Animations**: Three.js (React Three Fiber) for the dynamic background ambient.

### Smart Contract Layer (Solidity)
- **ERC20 Implementation**: Standard-compliant tokens (`BBUSD`/`BBETH`) with custom faucet logic.
- **Swap Logic**:
    - **Math**: `amountOut = (amountIn * (1000 - feeRate) * Price) / (Denominator)`
    - **Safety**: Slippage checks (`minAmountOut`) passed as arguments from the frontend.
- **Chainlink Integration**: Reliable price data directly from decentralized oracles.

---

## 🛠 Project Structure

```text
├── app/                  # Next.js App Router (Swap, Portfolio, History)
├── components/           # Reusable UI (Navbar, Cards, ConnectButton)
├── contracts/            # Solidity Smart Contracts (DEX, Tokens)
├── hooks/                # Custom Web3 hooks (History tracking)
├── public/               # Static assets & icons
├── utils/                # ABIs, Contract Addresses, and Formatters
└── README.md             # This comprehensive guide
```

---

## 🚀 Deployment & Local Setup

### Live Contract Addresses (Sepolia)
- **Swap Interface**: `0x1113997E5491012dF8BD1402C8e67465905cB3C7`
- **BlockbankUSD**: `0x7297075a92D2b3144119889ef4f991726A3afFE4`
- **BlockbankETH**: `0xaDcCCF2eA5bF1069FC14c01505c928d357b171ee`
- **Chainlink ETH/USD Feed**: `0x694AA1769357215DE4FAC081bf1f309aDC325306`

### Running Locally

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/enverkorkmaz/blockbankdex.git
    cd blockbankdex
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env.local` for your WalletConnect project ID (optional for local dev):
    ```env
    NEXT_PUBLIC_WC_PROJECT_ID=your_id_here
    ```

3.  **Start Dev Server**:
    ```bash
    npm run dev
    ```

---

## ⚙️ Administrative Functions (Owner Only)
The contract owner has access to several management features:
- `setFee(uint256 _newFee)`: Update the fee rate (capped at 5% for user safety).
- `depositLiquidity(...)`: Add tokens to the swap pool.
- `withdrawLiquidity(...)`: Collect accumulated fees or withdraw pool assets.
- `emergencyWithdraw(...)`: Drain all tokens to a safe address in case of migration.

---

## 🤝 Contribution
Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.

---

**Built with passion by Enver Korkmaz.**  
*Connecting the future of finance, one block at a time.* 🌐🏦
