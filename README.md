# fewsats-ts

A TypeScript client for the Fewsats API.

## Installation

```bash
npm install fewsats-ts
```

## Usage

```typescript
import Fewsats from 'fewsats-ts';

// Initialize the client with your API key
const fewsats = new Fewsats({
  apiKey: 'your-api-key', // Or set FEWSATS_API_KEY environment variable
});

// Get user info
async function getUserInfo() {
  try {
    const me = await fewsats.me();
    console.log('User info:', me);
  } catch (error) {
    console.error('Error fetching user info:', error);
  }
}

// Create an offer
async function createOffer() {
  try {
    const offers = [
      {
        amount: 1000, // in cents (10 USD)
        currency: 'USD',
        description: 'Digital product description',
        title: 'Product Title',
        type: 'one-off',
      }
    ];
    
    const result = await fewsats.createOffers(offers);
    console.log('Offer created:', result);
  } catch (error) {
    console.error('Error creating offer:', error);
  }
}

// Pay a lightning invoice
async function payInvoice() {
  try {
    const result = await fewsats.payLightning({
      invoice: 'lnbc...', // Lightning invoice
      amount: 1000, // Amount in cents
      currency: 'USD',
      description: 'Payment for services',
    });
    console.log('Payment result:', result);
  } catch (error) {
    console.error('Error making payment:', error);
  }
}
```

## API Reference

### Constructor

```typescript
new Fewsats(options?: {
  apiKey?: string;
  baseUrl?: string;
})
```

### Methods

- `me()`: Get user information
- `balance()`: Get user balance
- `paymentMethods()`: Get available payment methods
- `createOffers(offers: Partial<Offer>[])`: Create offers
- `getPaymentDetails(options: PaymentDetailsOptions)`: Get payment details
- `getPaymentStatus(paymentContextToken: string)`: Get payment status
- `setWebhook(webhookUrl: string)`: Set webhook URL
- `payLightning(options: PayLightningRequest)`: Pay a lightning invoice
- `payOffer(offerId: string, l402Offers: L402Offers)`: Pay for an offer
- `payOfferStr(offerId: string, l402OffersStr: string)`: Pay for an offer with JSON string
- `paymentInfo(pid: string)`: Get payment information
- `asTools()`: Get OpenAI tools definition

## License

MIT 