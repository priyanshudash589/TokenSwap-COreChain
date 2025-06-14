// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenSwap {
    IERC20 public tokenA;
    IERC20 public tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    uint256 public constant FEE_PERCENT = 3; // 0.3% fee

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Invalid amounts");

        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        reserveA += amountA;
        reserveB += amountB;
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Input must be > 0");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        uint256 amountInWithFee = amountIn * (1000 - FEE_PERCENT);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;

        return numerator / denominator;
    }

    function swapAForB(uint256 amountIn) external {
        require(tokenA.transferFrom(msg.sender, address(this), amountIn), "Transfer failed");

        uint256 amountOut = getAmountOut(amountIn, reserveA, reserveB);
        require(tokenB.transfer(msg.sender, amountOut), "Swap failed");

        reserveA += amountIn;
        reserveB -= amountOut;
    }

    function swapBForA(uint256 amountIn) external {
        require(tokenB.transferFrom(msg.sender, address(this), amountIn), "Transfer failed");

        uint256 amountOut = getAmountOut(amountIn, reserveB, reserveA);
        require(tokenA.transfer(msg.sender, amountOut), "Swap failed");

        reserveB += amountIn;
        reserveA -= amountOut;
    }
}
