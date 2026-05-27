// @ts-nocheck
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { mintPropertyNFT } from '@/lib/web3';

interface MintButtonProps {
  contractAddress: string;
  tokenURI: string;
  onMint: (txHash: string) => void;
}

export default function MintButton({ contractAddress, tokenURI, onMint }: MintButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleMint = async () => {
    setLoading(true);
    try {
      const provider = new (window as unknown as { ethereum: new () => { BrowserProvider: typeof BrowserProvider } }).ethereum;
      const { BrowserProvider } = await import('ethers');
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      const txHash = await mintPropertyNFT(contractAddress, tokenURI, signer);
      onMint(txHash);
    } catch (err: Error) {
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleMint} disabled={loading}>
      {loading ? 'Minting...' : 'Mint NFT'}
    </Button>
  );
}