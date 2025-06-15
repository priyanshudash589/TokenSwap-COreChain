"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownUp, Wallet, Loader2, Settings } from "lucide-react";
import { useEthers } from "@/lib/useEther";
import tokenSwapArtifact from "@/lib/abi/TokenSwap.json";
import tokenArtifact from "@/lib/abi/MockERC20.json";
import { ethers } from "ethers";

// Extract ABI from artifacts (Fix for "abi is not iterable" error)
const tokenSwapAbi = tokenSwapArtifact.abi || tokenSwapArtifact;
const tokenAbi = tokenArtifact.abi || tokenArtifact;

// Debug: Check if ABI is correct
console.log("TokenSwap ABI:", tokenSwapAbi);
console.log("Token ABI:", tokenAbi);

// Mock token data
const tokens = [
  { id: "tokenA", name: "Token A", symbol: "TKA", icon: "🅰️" },
  { id: "tokenB", name: "Token B", symbol: "TKB", icon: "🅱️" },
];

export default function TokenSwapDApp() {
  const [fromToken, setFromToken] = useState("eth");
  const [toToken, setToToken] = useState("usdc");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [exchangeRate] = useState(2450.75); // Mock exchange rate

  // Deployed contract addresses
  const TOKEN_SWAP_ADDRESS = "0x5f2f5Bb81b81f59bd22D38a1c24D841fAf517AB8";
  const TOKEN_A_ADDRESS = "0xc97E96D86788ECBD9dc2aF2dC24B936A775f020a";
  const TOKEN_B_ADDRESS = "0x95484e9dC1aEc00376a963b3896F7a23bdc38179";

  console.log("=== Address Validation ===");
  console.log(
    "TOKEN_SWAP_ADDRESS:",
    TOKEN_SWAP_ADDRESS,
    "Valid:",
    ethers.isAddress(TOKEN_SWAP_ADDRESS || "")
  );
  console.log(
    "TOKEN_A_ADDRESS:",
    TOKEN_A_ADDRESS,
    "Valid:",
    ethers.isAddress(TOKEN_A_ADDRESS || "")
  );
  console.log(
    "TOKEN_B_ADDRESS:",
    TOKEN_B_ADDRESS,
    "Valid:",
    ethers.isAddress(TOKEN_B_ADDRESS || "")
  );
  console.log("=== ABI Validation ===");
  console.log("tokenSwapAbi is array:", Array.isArray(tokenSwapAbi));
  console.log("tokenAbi is array:", Array.isArray(tokenAbi));

  if (!TOKEN_SWAP_ADDRESS || !ethers.isAddress(TOKEN_SWAP_ADDRESS)) {
    throw new Error(`Invalid contract address: ${TOKEN_SWAP_ADDRESS}`);
  }

  const { signer, address } = useEthers();

  // Contract instances with proper error handling
  const tokenSwapContract =
    signer && Array.isArray(tokenSwapAbi)
      ? new ethers.Contract(TOKEN_SWAP_ADDRESS, tokenSwapAbi, signer)
      : null;

  const tokenAContract =
    signer && Array.isArray(tokenAbi)
      ? new ethers.Contract(TOKEN_A_ADDRESS, tokenAbi, signer)
      : null;

  const tokenBContract =
    signer && Array.isArray(tokenAbi)
      ? new ethers.Contract(TOKEN_B_ADDRESS, tokenAbi, signer)
      : null;

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(Number(value))) {
      // Mock calculation
      const estimated = (Number(value) * exchangeRate).toFixed(2);
      setToAmount(estimated);
    } else {
      setToAmount("");
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount("");
    setToAmount("");
  };

  const handleSwap = async () => {
    if (!tokenSwapContract || !tokenAContract || !fromAmount) {
      alert("Please connect wallet and enter amount");
      return;
    }

    setIsSwapping(true);
    try {
      const amountIn = ethers.parseUnits(fromAmount, 18);
      const isAtoB = fromToken === "tokenA";
      const fromContract = isAtoB ? tokenAContract : tokenBContract;
      const swapMethod = isAtoB ? "swapAForB" : "swapBForA";

      console.log("To address:", TOKEN_SWAP_ADDRESS);
      if (!ethers.isAddress(TOKEN_SWAP_ADDRESS)) {
        throw new Error(
          "Invalid TOKEN_SWAP_ADDRESS: ENS lookup is not supported on this network"
        );
      }

      // Approve
      const approveTx = await fromContract.approve(
        TOKEN_SWAP_ADDRESS,
        amountIn
      );
      await approveTx.wait();
      console.log("Approval successful");

      // Swap
      const swapTx = await tokenSwapContract[swapMethod](amountIn);
      await swapTx.wait();
      console.log("Swap successful");

      alert("Swap successful!");
      setFromAmount("");
      setToAmount("");
    } catch (err) {
      console.error("Swap error:", err);
      alert(`Swap failed: ${err.message || err}`);
    } finally {
      setIsSwapping(false);
    }
  };

  const getTokenById = (id: string) => tokens.find((token) => token.id === id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SwapDApp
          </h1>
        </div>

        <Button
          onClick={() => setIsConnected(!isConnected)}
          className={`${
            isConnected
              ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          } rounded-full px-6`}
          variant={isConnected ? "outline" : "default"}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isConnected
            ? `Connected: ${address?.slice(0, 6)}...`
            : "Connect Wallet"}
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex justify-center px-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
          <CardContent className="p-6">
            {/* Settings Icon */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Swap Tokens
              </h2>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {/* From Token */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">From</span>
                  <span className="text-sm text-gray-600">
                    Balance: {getTokenById(fromToken)?.balance}
                  </span>
                </div>
                <div className="flex space-x-3">
                  <Select value={fromToken} onValueChange={setFromToken}>
                    <SelectTrigger className="w-32 bg-white border-0 shadow-sm rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token) => (
                        <SelectItem key={token.id} value={token.id}>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{token.icon}</span>
                            <span>{token.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className="flex-1 text-right text-lg font-medium border-0 bg-transparent focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSwapTokens}
                  variant="outline"
                  size="icon"
                  className="rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 shadow-sm"
                >
                  <ArrowDownUp className="w-4 h-4" />
                </Button>
              </div>

              {/* To Token */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">To</span>
                  <span className="text-sm text-gray-600">
                    Balance: {getTokenById(toToken)?.balance}
                  </span>
                </div>
                <div className="flex space-x-3">
                  <Select value={toToken} onValueChange={setToToken}>
                    <SelectTrigger className="w-32 bg-white border-0 shadow-sm rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token) => (
                        <SelectItem key={token.id} value={token.id}>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{token.icon}</span>
                            <span>{token.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={toAmount}
                    readOnly
                    className="flex-1 text-right text-lg font-medium border-0 bg-transparent focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>

              {/* Exchange Rate */}
              {fromAmount && toAmount && (
                <div className="text-center text-sm text-gray-600 py-2">
                  1 {getTokenById(fromToken)?.symbol} ={" "}
                  {exchangeRate.toLocaleString()}{" "}
                  {getTokenById(toToken)?.symbol}
                </div>
              )}

              {/* Swap Button */}
              <Button
                onClick={handleSwap}
                disabled={
                  !isConnected ||
                  !fromAmount ||
                  isSwapping ||
                  !tokenSwapContract
                }
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSwapping ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Swapping...
                  </>
                ) : !isConnected ? (
                  "Connect Wallet to Swap"
                ) : !fromAmount ? (
                  "Enter Amount"
                ) : !tokenSwapContract ? (
                  "Contract Not Available"
                ) : (
                  "Swap Tokens"
                )}
              </Button>

              {/* Additional Info */}
              {fromAmount && toAmount && (
                <div className="bg-blue-50 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Minimum received</span>
                    <span className="font-medium">
                      {(Number(toAmount) * 0.995).toFixed(2)}{" "}
                      {getTokenById(toToken)?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price impact</span>
                    <span className="font-medium text-green-600">
                      {"<0.01%"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Network fee</span>
                    <span className="font-medium">~$2.50</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-500">
        <p>Powered by decentralized protocols • Trade at your own risk</p>
      </footer>
    </div>
  );
}
