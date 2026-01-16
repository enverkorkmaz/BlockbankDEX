// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BlockbankETH is ERC20 {
    address public owner;
    uint8 private constant _decimals = 18;

    constructor(uint256 initialSupply) ERC20("Blockbank ETH", "BBETH") {
        owner = msg.sender;
        _mint(msg.sender, initialSupply * 10 ** _decimals);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Faucet function for testing
    function faucet() external {
        _mint(msg.sender, 1000 * 10 ** _decimals);
    }

    function decimals() public pure override returns (uint8) {
        return _decimals;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is zero address");
        owner = newOwner;
    }
}
