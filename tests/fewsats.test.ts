// fewsats.test.ts
import { Fewsats } from '../src/index';
import {
  UserInfo,
  Balance,
  PaymentMethod,
  Offer,
  L402Offers,
  CreatedOffer,
  PaymentDetails,
  PaymentStatus,
  PaymentResponse,
} from '../src/types';
import axios from 'axios';
// Replace with your actual API key
// const API_KEY = process.env.FEWSATS_API_KEY;
const API_KEY = process.env.FEWSATS_LOCAL_API_KEY;

describe('Fewsats API Tests', () => {
  let client: Fewsats;
  let createdOffers: CreatedOffer;
  let paymentContextToken: string;
  let paymentRequestUrl: string;
  let offerId: string;

  beforeAll(() => {
    client = new Fewsats({ apiKey: API_KEY, baseUrl: 'http://localhost:8000'});
  });

  it('should fetch user info', async () => {
    const userInfo: UserInfo = await client.me();
    
    // Type validation
    expect(userInfo).toHaveProperty('id');
    expect(userInfo).toHaveProperty('email');
    expect(userInfo).toHaveProperty('created_at');
    
    // Field type validation
    expect(['string', 'number']).toContain(typeof userInfo.id);
    expect(typeof userInfo.email).toBe('string');
    expect(typeof userInfo.created_at).toBe('string');
  });

  it('should fetch balance', async () => {
    const balance: Balance[] = await client.balance();
    
    // Type validation
    expect(Array.isArray(balance)).toBe(true);
    
    // Field validation
    balance.forEach(b => {
      expect(typeof b.currency).toBe('string');
      expect(typeof b.balance).toBe('number');
    });
  });

  it('should fetch payment methods', async () => {
    const paymentMethods: PaymentMethod[] = await client.paymentMethods();
    
    // Type validation
    expect(Array.isArray(paymentMethods)).toBe(true);
    
    // Field validation
    paymentMethods.forEach(pm => {
      expect(['string', 'number']).toContain(typeof pm.id);
      // Type is optional now
      if (pm.type) expect(typeof pm.type).toBe('string');
      if (pm.last4) expect(typeof pm.last4).toBe('string');
      if (pm.brand) expect(typeof pm.brand).toBe('string');
      if (pm.exp_month) expect(typeof pm.exp_month).toBe('number');
      if (pm.exp_year) expect(typeof pm.exp_year).toBe('number');
      if (pm.is_default !== undefined) expect(typeof pm.is_default).toBe('boolean');
    });
  });

  it('should create offers', async () => {
    const timestamp = Date.now();
    const offerData: Offer[] = [
      {
        offerId: `test_offer_${timestamp}`,
        amount: 1,
        currency: 'USD',
        description: 'Test offer',
        title: 'Test Package',
        paymentMethods: ['lightning'],
        type: 'one-off'
      },
    ];
    
    createdOffers = await client.createOffers(offerData);
    
    // Type validation
    expect(createdOffers).toHaveProperty('paymentContextToken');
    expect(createdOffers).toHaveProperty('paymentRequestUrl');
    expect(createdOffers).toHaveProperty('version');
    expect(Array.isArray(createdOffers.offers)).toBe(true);
    
    // Field validation
    expect(typeof createdOffers.paymentContextToken).toBe('string');
    expect(typeof createdOffers.paymentRequestUrl).toBe('string');
    expect(typeof createdOffers.version).toBe('string');
    
    // Data validation 
    expect(createdOffers.offers[0]).toMatchObject({
      offerId: `test_offer_${timestamp}`,
      amount: 1,
      currency: 'USD',
      description: 'Test offer',
      title: 'Test Package'
    });
    
    // Store for next tests
    paymentContextToken = createdOffers.paymentContextToken;
    paymentRequestUrl = createdOffers.paymentRequestUrl;
    offerId = offerData[0].offerId;
  });

  it('should get payment details', async () => {
    const paymentDetails: PaymentDetails = await client.getPaymentDetails(
      paymentRequestUrl,
      offerId,
      'lightning',
      paymentContextToken
    );
    
    // Type validation
    expect(paymentDetails).toHaveProperty('expiresAt');
    expect(paymentDetails).toHaveProperty('offerId');
    expect(paymentDetails).toHaveProperty('paymentRequest');
    expect(paymentDetails).toHaveProperty('version');
    
    // Field validation
    expect(typeof paymentDetails.expiresAt).toBe('string');
    expect(typeof paymentDetails.offerId).toBe('string');
    expect(typeof paymentDetails.version).toBe('string');
    
    // Payment request should be an object with properties
    expect(typeof paymentDetails.paymentRequest).toBe('object');
    
    // If lightning_invoice exists in paymentRequest
    if (paymentDetails.paymentRequest.lightning_invoice) {
      expect(typeof paymentDetails.paymentRequest.lightning_invoice).toBe('string');
    }
  });

  it('should get payment status', async () => {
    const paymentStatus: PaymentStatus = await client.getPaymentStatus(paymentContextToken);
    
    // Type validation
    expect(paymentStatus).toHaveProperty('status');
    
    // Field validation
    expect(typeof paymentStatus.status).toBe('string');
    if (paymentStatus.paidAt) expect(typeof paymentStatus.paidAt).toBe('string');
    if (paymentStatus.paymentContextToken) expect(typeof paymentStatus.paymentContextToken).toBe('string');
  });

  it('should pay offer', async () => {
    // Create L402Offers from createdOffers
    const l402Offers: L402Offers = {
      offers: createdOffers.offers,
      paymentContextToken,
      paymentRequestUrl,
      version: createdOffers.version
    };
    
    const paymentResponse: PaymentResponse = await client.payOffer(offerId, l402Offers);
    
    // Type validation
    expect(paymentResponse).toHaveProperty('id');
    expect(paymentResponse).toHaveProperty('status');
    
    // Field validation
    expect(['string', 'number']).toContain(typeof paymentResponse.id);
    expect(typeof paymentResponse.status).toBe('string');
    
    // Field validation for optional fields
    if (paymentResponse.createdAt) expect(typeof paymentResponse.createdAt).toBe('string');
    if (paymentResponse.paymentMethod) expect(typeof paymentResponse.paymentMethod).toBe('string');
    
    const pid = paymentResponse.id;
    if (pid) {
      const paymentInfo: PaymentResponse = await client.paymentInfo(String(pid));

      
      // Response validation
      expect(paymentInfo).toHaveProperty('id');
      expect(paymentInfo.id).toEqual(pid);
      expect(paymentInfo).toHaveProperty('status');
      expect(typeof paymentInfo.status).toBe('string');
    }
  }, 35000);
});