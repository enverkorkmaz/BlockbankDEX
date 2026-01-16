// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract BlockbankSwap is ReentrancyGuard, Pausable, Ownable {
    IERC20 public immutable bbusd;
    IERC20 public immutable bbeth;
    AggregatorV3Interface public immutable ethUsdPriceFeed;

    uint256 public feeRate = 1; // 1 = 0.1% (Denominator 1000)

    event SwappedBbusdToBbeth(address indexed user, uint256 bbusdIn, uint256 bbethOut);
    event SwappedBbethToBbusd(address indexed user, uint256 bbethIn, uint256 bbusdOut);
    event EmergencyWithdraw(address indexed to, uint256 bbethAmount, uint256 bbusdAmount);
    event FeeUpdated(uint256 newFee);
    event LiquidityAdded(uint256 bbusdAmount, uint256 bbethAmount);
    event LiquidityRemoved(address indexed to, uint256 bbusdAmount, uint256 bbethAmount);

    constructor() Ownable(msg.sender) {
        // HARDCODED ADDRESSES
        address _bbusd = 0x7297075a92D2b3144119889ef4f991726A3afFE4;
        address _bbeth = 0xaDcCCF2eA5bF1069FC14c01505c928d357b171ee;
        address _ethUsdPriceFeed = 0x694AA1769357215DE4FAC081bf1f309aDC325306;

        bbusd = IERC20(_bbusd);
        bbeth = IERC20(_bbeth);
        ethUsdPriceFeed = AggregatorV3Interface(_ethUsdPriceFeed);
    }

    function setFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 50, "Fee too high (max 5%)"); // Max 5% safety cap
        feeRate = _newFee;
        emit FeeUpdated(_newFee);
    }

    function getEthUsdPrice() public view returns (uint256 price, uint8 decimals) {
        (
            , int256 rawPrice,, uint256 updatedAt,
        ) = ethUsdPriceFeed.latestRoundData();
        require(rawPrice > 0, "Invalid price");
        require(updatedAt >= block.timestamp - 1 hours, "Stale price");
        price = uint256(rawPrice);
        decimals = ethUsdPriceFeed.decimals();
    }

    function swapBbusdToBbeth(uint256 bbusdAmount, uint256 minBbethOut)
    external whenNotPaused nonReentrant {
        require(bbusdAmount > 0, "Zero input");
        (uint256 ethUsd, uint8 feedDecimals) = getEthUsdPrice();

        // Dynamic Fee
        // feeRate = 1 -> 0.1%. Multiplier = 1000 - 1 = 999.
        uint256 bbusdAmountAfterFee = (bbusdAmount * (1000 - feeRate)) / 1000;

        uint256 bbethAmount = (bbusdAmountAfterFee * 10**(18 + feedDecimals - 6)) / ethUsd;

        require(bbethAmount >= minBbethOut, "Slippage: too little output");
        require(bbeth.balanceOf(address(this)) >= bbethAmount, "Insufficient BBETH in contract");

        require(bbusd.transferFrom(msg.sender, address(this), bbusdAmount), "BBUSD transfer fail");
        require(bbeth.transfer(msg.sender, bbethAmount), "BBETH transfer fail");

        emit SwappedBbusdToBbeth(msg.sender, bbusdAmount, bbethAmount);
    }

    function swapBbethToBbusd(uint256 bbethAmount, uint256 minBbusdOut)
    external whenNotPaused nonReentrant {
        require(bbethAmount > 0, "Zero input");
        (uint256 ethUsd, uint8 feedDecimals) = getEthUsdPrice();

        // Dynamic Fee
        uint256 bbethAmountAfterFee = (bbethAmount * (1000 - feeRate)) / 1000;

        uint256 bbusdAmount = (bbethAmountAfterFee * ethUsd) / (10**(feedDecimals + 18 - 6));

        require(bbusdAmount >= minBbusdOut, "Slippage: too little output");
        require(bbusd.balanceOf(address(this)) >= bbusdAmount, "Insufficient BBUSD in contract");

        require(bbeth.transferFrom(msg.sender, address(this), bbethAmount), "BBETH transfer fail");
        require(bbusd.transfer(msg.sender, bbusdAmount), "BBUSD transfer fail");

        emit SwappedBbethToBbusd(msg.sender, bbethAmount, bbusdAmount);
    }
    
    function depositLiquidity(uint256 bbusdAmount, uint256 bbethAmount) external onlyOwner {
        require(bbusdAmount > 0 || bbethAmount > 0, "Zero deposit");
        if(bbusdAmount > 0) {
            require(bbusd.transferFrom(msg.sender, address(this), bbusdAmount), "Deposit BBUSD fail");
        }
        if(bbethAmount > 0) {
            require(bbeth.transferFrom(msg.sender, address(this), bbethAmount), "Deposit BBETH fail");
        }
        emit LiquidityAdded(bbusdAmount, bbethAmount);
    }

    // New: Partial Withdraw
    function withdrawLiquidity(uint256 bbusdAmount, uint256 bbethAmount) external onlyOwner {
        if(bbusdAmount > 0) {
             require(bbusd.transfer(msg.sender, bbusdAmount), "Withdraw BBUSD fail");
        }
        if(bbethAmount > 0) {
             require(bbeth.transfer(msg.sender, bbethAmount), "Withdraw BBETH fail");
        }
        emit LiquidityRemoved(msg.sender, bbusdAmount, bbethAmount);
    }

    function emergencyWithdraw(address to) external onlyOwner {
        require(to != address(0), "Zero address");
        uint256 bbethBal = bbeth.balanceOf(address(this));
        uint256 bbusdBal = bbusd.balanceOf(address(this));
        require(bbeth.transfer(to, bbethBal), "Withdraw BBETH fail");
        require(bbusd.transfer(to, bbusdBal), "Withdraw BBUSD fail");
        emit EmergencyWithdraw(to, bbethBal, bbusdBal);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function getEstimatedBbethForBbusd(uint256 bbusdAmount) external view returns (uint256) {
        (uint256 ethUsd, uint8 feedDecimals) = getEthUsdPrice();
        uint256 bbusdAmountAfterFee = (bbusdAmount * (1000 - feeRate)) / 1000;
        return (bbusdAmountAfterFee * 10**(18 + feedDecimals - 6)) / ethUsd;
    }

    function getEstimatedBbusdForBbeth(uint256 bbethAmount) external view returns (uint256) {
        (uint256 ethUsd, uint8 feedDecimals) = getEthUsdPrice();
        uint256 bbethAmountAfterFee = (bbethAmount * (1000 - feeRate)) / 1000;
        return (bbethAmountAfterFee * ethUsd) / (10**(feedDecimals + 18 - 6));
    }
}
