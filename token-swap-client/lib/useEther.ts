import { useEffect, useState } from "react";
import { ethers } from "ethers";

export function useEthers() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);

useEffect(() => {
  const connect = async () => {
    if ((window as any).ethereum) {
      const _provider = new ethers.BrowserProvider((window as any).ethereum);
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      const _signer = await _provider.getSigner();
      const _address = await _signer.getAddress();

      setProvider(_provider);
      setSigner(_signer);
      setAddress(_address);
    }
  };
  
  connect();
}, []);

  return { provider, signer, address };
}
