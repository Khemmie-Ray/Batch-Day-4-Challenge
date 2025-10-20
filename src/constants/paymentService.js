import { createBaseAccountSDK, getCryptoKeyAccount, base } from '@base-org/account';
import { numberToHex, encodeFunctionData, parseEther } from 'viem';

// Example NFT contract ABI
const nftABI = [
  {
    name: 'safeMint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }],
    outputs: []
  }
] as const;

async function sendSponsoredTransaction() {
  const sdk = createBaseAccountSDK({
    appName: 'Paymaster Demo',
    appLogoUrl: 'https://base.org/logo.png',
    appChainIds: [base.constants.CHAIN_IDS.baseSepolia],
  });

  const provider = sdk.getProvider();
  
  try {
    // Get the user's account
    const cryptoAccount = await getCryptoKeyAccount();
    const fromAddress = cryptoAccount?.account?.address;
    
    if (!fromAddress) {
      throw new Error('No account found');
    }

    // Your Paymaster service URL (use your proxy URL)
    const paymasterServiceUrl = process.env.NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL;
    
    // Prepare the transaction call
    const nftAddress = '0x119Ea671030FBf79AB93b436D2E20af6ea469a19';
    const calls = [
      {
        to: nftAddress,
        value: '0x0',
        data: encodeFunctionData({
          abi: nftABI,
          functionName: 'safeMint',
          args: [fromAddress]
        })
      }
    ];

    // Send the transaction with paymaster capabilities
    const result = await provider.request({
      method: 'wallet_sendCalls',
      params: [{
        version: '1.0',
        chainId: numberToHex(base.constants.CHAIN_IDS.baseSepolia),
        from: fromAddress,
        calls: calls,
        capabilities: {
          paymasterService: {
            url: paymasterServiceUrl
          }
        }
      }]
    });

    console.log('Sponsored transaction sent:', result);
    return result;
  } catch (error) {
    console.error('Sponsored transaction failed:', error);
    throw error;
  }
}