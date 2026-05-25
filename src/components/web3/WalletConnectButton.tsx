import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WalletConnectButtonProps {
  onConnect: (address: string) => void;
}

export default function WalletConnectButton({ onConnect }: WalletConnectButtonProps) {
  const handleConnect = async () => {
    try {
      const { connectWallet } = await import('@/lib/web3');
      const address = await connectWallet();
      onConnect(address);
    } catch (err: Error) {
      
    }
  };

  return (
    <Button onClick={handleConnect} variant="outline">
      Connect Wallet
    </Button>
  );
}
