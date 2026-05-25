import { useState } from 'react';
import { connectWallet, mintPropertyNFT } from '@/lib/web3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function PropertyTokensPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [tokenURI, setTokenURI] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMint = async () => {
    if (!walletAddress || !propertyId || !tokenURI) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const provider = new (window as any).ethereum;
      const ethersProvider = new (await import('ethers')).BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error('NFT contract address not configured');

      const txHash = await mintPropertyNFT(contractAddress, tokenURI, signer);

      await supabase.from('property_tokens').insert({
        property_id: propertyId,
        wallet_address: walletAddress,
        token_uri: tokenURI,
        tx_hash: txHash
      });

      alert(`NFT minted successfully! Tx: ${txHash}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Property Tokens (NFTs)</h1>

      <Card className="p-6 max-w-2xl mx-auto">
        {!walletAddress ? (
          <Button onClick={handleConnectWallet} className="w-full">
            Connect Wallet
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Connected Wallet</p>
              <p className="text-muted-foreground break-all">{walletAddress}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Property ID</label>
              <Input
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                placeholder="Enter property ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Token URI</label>
              <Input
                value={tokenURI}
                onChange={(e) => setTokenURI(e.target.value)}
                placeholder="https://example.com/metadata/1.json"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              onClick={handleMint}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Minting...' : 'Mint Property NFT'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
