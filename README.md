# fewsats

Simple TypeScript client for the Fewsats API. Accept and make payments with minimal code.

```bash
npm install fewsats
```

## Paying

Pay for products or services:

```typescript
import { Fewsats } from 'fewsats';

// Example Offer
const offer =l402_offer = {
   'offers':[
      {
         'amount':1,
         'balance':1,
         'currency':'USD',
         'description':'Purchase 1 credit for API access',
         'offer_id':'offer_1',
         'payment_methods':[
            'lightning'
         ],
         'title':'1 Credit Package',
      }
   ],
   'payment_context_token':'edb53dec-28f5-4cbb-924a-20e9003c20e1',
   'payment_request_url':'https://api.fewsats.com/v0/l402/payment-request',
   'version':'0.2.2'
}

const client = new Fewsats({ apiKey });
const payment = await client.payOffer('offer_1', offer);


```
## Getting Paid

Create payment offers and let customers pay you:

```typescript
import { Fewsats } from 'fewsats';

// Initialize with API key
const client = new Fewsats({ apiKey });

// Create a payment offer
const offer = await client.createOffers([{
  offerId: 'offer_1',
  amount: 500,  // cents
  currency: 'USD',
  title: '1 Credit Package',
  description: 'Purchase 1 credit for API access'
}]);


```



## Examples

Check out the examples directory for full usage examples:

```bash
# Run the simple usage example
export FEWSATS_API_KEY=your_api_key_here
npx ts-node examples/simple-usage.ts
```

The simple-usage.ts example demonstrates the complete payment flow:

**Vendor side:**
1. Creating a 1 cent offer
2. Checking the initial payment status

**Buyer side:**
3. Paying for the offer
4. Getting payment info

**Vendor side (after payment):**
5. Checking the final payment status (after a short delay)

## License

MIT 