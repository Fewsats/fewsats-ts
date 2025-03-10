import { Fewsats } from '../src';

// First, set your API key in environment variables or pass it directly
// process.env.FEWSATS_API_KEY = 'your-api-key';

const client = new Fewsats({
  apiKey: process.env.FEWSATS_API_KEY,
});

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function simpleFewsatsExample() {
  try {
    console.log('=== VENDOR SIDE ===');
    // 1. Create a 1 cent offer
    const timestamp = Date.now();
    const offers = [
      {
        offerId: `simple-offer-${timestamp}`, // Unique ID using timestamp
        amount: 1, // in cents (0.01 USD)
        currency: 'USD',
        description: 'A simple 1 cent offer for testing',
        title: 'One Cent Offer',
        paymentMethods: ['lightning'], // Specify payment method
      }
    ];
    
    console.log('Creating 1 cent offer...');
    const createdOffers = await client.createOffers(offers);
    console.log('Offer created:', JSON.stringify(createdOffers, null, 2));
    
    // Save important values from the created offer
    const offerId = offers[0].offerId;
    const paymentContextToken = createdOffers.paymentContextToken;
    
    // 2. Check initial offer status (VENDOR perspective)
    console.log('\nChecking initial payment status...');
    const initialStatus = await client.getPaymentStatus(paymentContextToken);
    console.log('Initial status:', JSON.stringify(initialStatus, null, 2));
    
    console.log('\n=== BUYER SIDE ===');
    // 3. Pay for the offer (BUYER perspective)
    console.log(`Paying for offer ${offerId}...`);
    const paymentResponse = await client.payOffer(offerId, createdOffers);
    console.log('Payment completed:', JSON.stringify(paymentResponse, null, 2));
    
    // 4. Get payment info (BUYER perspective)
    if (paymentResponse.id) {
      console.log(`\nChecking payment info for ID: ${paymentResponse.id}...`);
      const paymentInfo = await client.paymentInfo(String(paymentResponse.id));
      console.log('Payment info:', JSON.stringify(paymentInfo, null, 2));
    }
    
    console.log('\n=== VENDOR SIDE ===');
    // 5. Wait 5 seconds before checking final status to allow backend to update
    console.log('Waiting 15 seconds for payment to be processed...');
    await delay(15000);
    
    // 6. Check payment status again after payment (VENDOR perspective)
    console.log('Checking final payment status...');
    const finalStatus = await client.getPaymentStatus(paymentContextToken);
    console.log('Final status:', JSON.stringify(finalStatus, null, 2));
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

// Run the example
simpleFewsatsExample();