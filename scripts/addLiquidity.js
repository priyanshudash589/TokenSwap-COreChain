// scripts/addLiquidity.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  const TOKEN_A_ADDRESS = "0xc97E96D86788ECBD9dc2aF2dC24B936A775f020a";
  const TOKEN_B_ADDRESS = "0x95484e9dC1aEc00376a963b3896F7a23bdc38179";
  const TOKEN_SWAP_ADDRESS = "0x5f2f5Bb81b81f59bd22D38a1c24D841fAf517AB8";

  // Get contract instances - both use MockERC20
  const TokenA = await ethers.getContractAt("MockERC20", TOKEN_A_ADDRESS);
  const TokenB = await ethers.getContractAt("MockERC20", TOKEN_B_ADDRESS);
  const TokenSwap = await ethers.getContractAt("TokenSwap", TOKEN_SWAP_ADDRESS);

  // Define liquidity amounts
  const liquidityA = ethers.parseUnits("10000", 18); // 10,000 TKA
  const liquidityB = ethers.parseUnits("10000", 18); // 10,000 TKB (1:1 ratio)

  console.log("=== Current Balances ===");
  const balanceA = await TokenA.balanceOf(deployer.address);
  const balanceB = await TokenB.balanceOf(deployer.address);
  console.log("Your TKA balance:", ethers.formatUnits(balanceA, 18));
  console.log("Your TKB balance:", ethers.formatUnits(balanceB, 18));

  // Check current reserves
  console.log("\n=== Current Reserves ===");
  const currentReserveA = await TokenSwap.reserveA();
  const currentReserveB = await TokenSwap.reserveB();
  console.log("Current Reserve A:", ethers.formatUnits(currentReserveA, 18), "TKA");
  console.log("Current Reserve B:", ethers.formatUnits(currentReserveB, 18), "TKB");

  // Approve tokens for the TokenSwap contract
  console.log("\n=== Approving Tokens ===");
  console.log("Approving TKA...");
  const approveATx = await TokenA.approve(TOKEN_SWAP_ADDRESS, liquidityA);
  await approveATx.wait();
  console.log("✅ TKA approved");

  console.log("Approving TKB...");
  const approveBTx = await TokenB.approve(TOKEN_SWAP_ADDRESS, liquidityB);
  await approveBTx.wait();
  console.log("✅ TKB approved");

  // Add liquidity
  console.log("\n=== Adding Liquidity ===");
  console.log(`Adding ${ethers.formatUnits(liquidityA, 18)} TKA and ${ethers.formatUnits(liquidityB, 18)} TKB...`);
  const addLiquidityTx = await TokenSwap.addLiquidity(liquidityA, liquidityB);
  console.log("Transaction sent, waiting for confirmation...");
  await addLiquidityTx.wait();
  console.log("✅ Liquidity added successfully!");

  // Check updated reserves
  console.log("\n=== Updated Reserves ===");
  const newReserveA = await TokenSwap.reserveA();
  const newReserveB = await TokenSwap.reserveB();
  console.log("New Reserve A:", ethers.formatUnits(newReserveA, 18), "TKA");
  console.log("New Reserve B:", ethers.formatUnits(newReserveB, 18), "TKB");

  // Check your remaining balances
  console.log("\n=== Your Remaining Balances ===");
  const newBalanceA = await TokenA.balanceOf(deployer.address);
  const newBalanceB = await TokenB.balanceOf(deployer.address);
  console.log("Your TKA balance:", ethers.formatUnits(newBalanceA, 18));
  console.log("Your TKB balance:", ethers.formatUnits(newBalanceB, 18));

  console.log("\n🎉 Ready to swap tokens!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});