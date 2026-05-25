import ethers from 'ethers';

export const POLYGON_CHAIN_ID = 137;
export const POLYGON_RPC_URL = 'https://polygon-rpc.com';

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) throw new Error('No wallet installed');

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);
  return accounts[0];
}

export async function mintPropertyNFT(
  contractAddress: string,
  tokenURI: string,
  signer: ethers.Signer
): Promise<string> {
  const abi = [
    'function mint(string memory tokenURI) public returns (uint256)',
    'function ownerOf(uint256 tokenId) public view returns (address)'
  ];

  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.mint(tokenURI);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function getPropertyTokenOwner(
  contractAddress: string,
  tokenId: number
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
  const abi = ['function ownerOf(uint256 tokenId) public view returns (address)'];
  const contract = new ethers.Contract(contractAddress, abi, provider);
  return await contract.ownerOf(tokenId);
}
