import ethers from 'ethers';

export const BOOKING_CONTRACT_ABI = [
  'function createBooking(uint256 propertyId, uint256 checkIn, uint256 checkOut) public payable',
  'function cancelBooking(uint256 bookingId) public',
  'function getBooking(uint256 bookingId) public view returns (address guest, uint256 propertyId, uint256 checkIn, uint256 checkOut, uint8 status)',
  'event BookingCreated(uint256 bookingId, address guest, uint256 propertyId)'
];

export async function createBookingContract(
  contractAddress: string,
  propertyId: number,
  checkIn: Date,
  checkOut: Date,
  price: string,
  signer: ethers.Signer
): Promise<string> {
  const contract = new ethers.Contract(contractAddress, BOOKING_CONTRACT_ABI, signer);

  const tx = await contract.createBooking(
    propertyId,
    Math.floor(checkIn.getTime() / 1000),
    Math.floor(checkOut.getTime() / 1000),
    { value: ethers.parseEther(price) }
  );

  const receipt = await tx.wait();
  return receipt.hash;
}

export async function cancelBooking(
  contractAddress: string,
  bookingId: number,
  signer: ethers.Signer
): Promise<string> {
  const contract = new ethers.Contract(contractAddress, BOOKING_CONTRACT_ABI, signer);
  const tx = await contract.cancelBooking(bookingId);
  const receipt = await tx.wait();
  return receipt.hash;
}
