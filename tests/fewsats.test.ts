// fewsats.test.ts
import { Fewsats, Offer, L402Offers } from '../src/index';
import axios from 'axios';
// Replace with your actual API key
const API_KEY = process.env.FEWSATS_API_KEY;

describe('Fewsats API Tests', () => {
  let client: Fewsats;
  let createdOffers: any;
  let paymentContextToken: string;
  let paymentRequestUrl: string;
  let offerId: string;

  beforeAll(() => {
    client = new Fewsats({ apiKey: API_KEY });
  });

  it('should fetch user info', async () => {
    const userInfo = await client.me();
    expect(userInfo).toMatchSnapshot();
  });

  it('should fetch balance', async () => {
    const balance = await client.balance();
    expect(Array.isArray(balance)).toBe(true);
    expect(typeof balance[0].balance).toBe('number');
    expect(balance).toMatchSnapshot();
  });

  it('should fetch payment methods', async () => {
    const paymentMethods = await client.paymentMethods();
    expect(paymentMethods).toMatchSnapshot();
  });

  it('should create offers', async () => {
    const offerData = [
      {
        offer_id: `test_offer_${Date.now()}`, // Unique ID
        amount: 1,
        currency: 'USD',
        description: 'Test offer',
        title: 'Test Package',
        payment_methods: ['lightning']
      },
    ];
    createdOffers = await client.createOffers(offerData);
    expect(createdOffers).toMatchSnapshot();
    
    // Store values for later tests
    paymentContextToken = createdOffers.payment_context_token;
    paymentRequestUrl = createdOffers.payment_request_url;
    offerId = offerData[0].offer_id;
  });

  it('should get payment details', async () => {
    try {
      const paymentDetails = await client.getPaymentDetails(
        paymentRequestUrl,
        offerId,
        'lightning',
        paymentContextToken
      );
      expect(paymentDetails.data).toMatchSnapshot()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error response:', error.response?.data)
      } else {
        console.error('Unexpected error:', error)
      }
      throw error
    }    
    // expect(paymentDetails.data).toMatchSnapshot();
  });

  it('should get payment status', async () => {
    const paymentStatus = await client.getPaymentStatus(paymentContextToken);
    expect(paymentStatus).toMatchSnapshot();
  });

  it('should pay offer', async () => {
    const offers = createdOffers.offers.map(Offer.from); 
    const l402Offers = new L402Offers(
      offers,
      paymentContextToken,
      paymentRequestUrl,
      createdOffers.version
    );
    const paymentResponse = await client.payOffer(offerId, l402Offers);
    expect(paymentResponse).toMatchSnapshot();
    
    // Test payment info with the purchase ID
    const pid = paymentResponse.id; // Adjust based on actual response structure
    if (pid) {
      const paymentInfo = await client.paymentInfo(pid);
      expect(paymentInfo).toMatchSnapshot();
    }
  }, 35000); // 35 seconds timeout for Jest test

});