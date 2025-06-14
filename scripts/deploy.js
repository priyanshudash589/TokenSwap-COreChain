const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy TokenA
  const Token = await ethers.getContractFactory("MockERC20");
  const tokenA = await Token.deploy("Token A", "TKA", ethers.parseEther("1000000"));
  await tokenA.waitForDeployment(); // Wait for deployment first
  const tokenAAddress = await tokenA.getAddress(); // Then get address
  console.log("Token A deployed at:", tokenAAddress);

  // Deploy TokenB
  const tokenB = await Token.deploy("Token B", "TKB", ethers.parseEther("1000000"));
  await tokenB.waitForDeployment(); // Wait for deployment first
  const tokenBAddress = await tokenB.getAddress(); // Then get address
  console.log("Token B deployed at:", tokenBAddress);

  // Deploy TokenSwap contract
  const Swap = await ethers.getContractFactory("TokenSwap");
  const tokenSwap = await Swap.deploy(tokenAAddress, tokenBAddress); // Use stored addresses
  await tokenSwap.waitForDeployment(); // Wait for deployment first
  const tokenSwapAddress = await tokenSwap.getAddress(); // Then get address
  console.log("TokenSwap deployed at:", tokenSwapAddress);

  // Transfer initial liquidity to swap contract
  const amount = ethers.parseEther("500000");

  await tokenA.transfer(tokenSwapAddress, amount);
  await tokenB.transfer(tokenSwapAddress, amount);

  console.log("Initial liquidity added.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });