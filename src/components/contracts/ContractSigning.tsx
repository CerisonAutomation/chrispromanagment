import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { createBookingContract } from '@/lib/smart-contracts';

interface ContractSigningProps {
  propertyId: number;
  checkIn: Date;
  checkOut: Date;
  price: string;
  onSuccess: (txHash: string) => void;
}

export default function ContractSigning({ propertyId, checkIn, checkOut, price, onSuccess }: ContractSigningProps) {
  const [loading, setLoading] = useState(false);

  const handleSign = async () => {
    setLoading(true);
    try {
      const provider = new (window as unknown as { ethereum: new () => { BrowserProvider: typeof BrowserProvider } }).ethereum;
      const { BrowserProvider } = await import('ethers');
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      const contractAddress = import.meta.env.VITE_BOOKING_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error('Contract address not configured');

      const txHash = await createBookingContract(
        contractAddress,
        propertyId,
        checkIn,
        checkOut,
        price,
        signer
      );

      onSuccess(txHash);
    } catch (err: Error) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Smart Contract Booking</h3>
      <div className="space-y-2 mb-4">
        <p>Property ID: {propertyId}</p>
        <p>Check-in: {checkIn.toLocaleDateString()}</p>
        <p>Check-out: {checkOut.toLocaleDateString()}</p>
        <p>Price: {price} ETH</p>
      </div>
      <Button onClick={handleSign} disabled={loading} className="w-full">
        {loading ? 'Signing...' : 'Sign Contract & Pay'}
      </Button>
    </Card>
  );
}
