# 🏦 BlockBank DEX: The Future of Decentralized Trading

BlockBank DEX is a professional-grade, full-stack decentralized exchange (DEX) platform built on the **Ethereum Sepolia Testnet**. This project demonstrates a complete DeFi ecosystem, combining secure smart contracts, real-time price oracles, and a premium user experience.

---

## 🌟 Overview

BlockBank DEX is designed to provide a seamless trading experience between **BBUSD** (Stablecoin) and **BBETH** (Synthetic ETH). Unlike simple swap templates, this platform integrates institutional-grade features like global price oracles and professional portfolio tracking.

### Why BlockBank?
- **Speed & Precision**: Built with Next.js 15 and Wagmi v2 for near-instant UI updates.
- **Reliability**: Uses **Chainlink V3 Oracles** to prevent price manipulation and ensure fair swaps.
- **Transparency**: Every swap, fee update, and liquidity movement is broadcasted via on-chain events.

---

## 🛠 Features in Detail

### 1. 🔄 Professional Swap Engine
The core of the platform is a robust swap mechanism that handles multi-decimal conversions (6 decimals for BBUSD, 18 for BBETH) with ease.
- **Dynamic Pricing**: Prices are fetched directly from the Chainlink `ETH/USD` feed on Sepolia.
- **Fee Intelligence**: A 0.1% dynamic fee is applied to every trade, ensuring the sustainability of the liquidity pool.
- **Slippage Protection**: Users can set their tolerance levels to ensure they never get a bad deal during volatile periods.

### 2. 📊 Advanced Portfolio Management
A dedicated dashboard that gives users a 360-degree view of their assets.
- **Visual Analytics**: Interactive Pie Charts show your asset distribution at a glance.
- **Net Worth Calculation**: Automatically calculates your total balance in USD using live market data.
- **Native ETH Support**: Tracks your Sepolia ETH alongside your BlockBank tokens.

### 3. 🚰 On-Chain Developer Tools
Testing DeFi shouldn't be hard.
- **Integrated Faucet**: Mint 1,000 BBUSD or 1,000 BBETH directly to your wallet with a single click.
- **Wallet Integration**: One-click "Add to Wallet" feature using `watchAsset` to instantly see your tokens in MetaMask.

---

## 📜 Smart Contract Architecture

The system consists of three main contracts, designed with security and modularity in mind.

### 1. `BlockbankSwap.sol` (The Core)
This is the "Brain" of the DEX.
- **Fee Logic**: Implements a `feeRate` that can be adjusted by the owner (capped at 5% for safety).
- **Security**: Utilizes OpenZeppelin's `ReentrancyGuard` to prevent re-entrancy attacks and `Pausable` for emergency stops.
- **Oracle**: Integrates `AggregatorV3Interface` to pull live data from Chainlink.

### 2. `BlockbankUSD.sol` & `BlockBankETH.sol` (The Assets)
Custom ERC20 tokens representing the stable and volatile sides of the exchange.
- **Built-in Faucet**: These tokens include a public `faucet()` function, eliminating the need for external dispencers during testing.

---

## 📍 Contract Addresses (Sepolia)

| Component | Contract Address |
| :--- | :--- |
| **DEX Swap Engine** | `0x1113997E5491012dF8BD1402C8e67465905cB3C7` |
| **BlockbankUSD (BBUSD)** | `0x7297075a92D2b3144119889ef4f991726A3afFE4` |
| **BlockbankETH (BBETH)** | `0xaDcCCF2eA5bF1069FC14c01505c928d357b171ee` |
| **Chainlink ETH/USD Feed** | `0x694AA1769357215DE4FAC081bf1f309aDC325306` |

---

## 💻 Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS v4.
- **Web3**: Wagmi v2, Viem, RainbowKit.
- **Charts**: Recharts.
- **Background**: Three.js (React Three Fiber) for an immersive ambient experience.
- **Contracts**: Solidity 0.8.20, OpenZeppelin.

---

## 🚀 Installation & Setup

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/enverkorkmaz/BlockbankDEX.git
   cd blockbankdex
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Project**:
   ```bash
   npm run dev
   ```

---

## 🛡 Security & Design Decisions

- **Why Chainlink?** We don't rely on internal price balances (which can be manipulated). We use the industry-standard decentralized price oracle.
- **Why Next.js 15?** To leverage the latest App Router features for a lightning-fast, SEO-friendly Web3 frontend.
- **Fee Management**: Fees are stored within the contract and can be withdrawn by the owner, creating a real protocol revenue model.

---

**Developed with ❤️ by Enver Korkmaz.**  
*Empowering the world with decentralized finance.* 🌐🔱
