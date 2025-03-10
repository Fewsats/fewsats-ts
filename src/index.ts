// fewsats.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  UserInfo,
  Balance,
  PaymentMethod,
  OfferData,
  L402OffersData,
  Offer,
  L402Offers,
  CreatedOffer,
  CreatedOfferData,
  PaymentDetails,
  PaymentDetailsData,
  PaymentStatus,
  PaymentStatusData,
  PaymentResponse,
  PaymentResponseData,
  FewsatsOptions
} from './types'

// Helper functions for converting between API and client types
export function dataToOffer(data: OfferData): Offer {
  return {
    offerId: data.offer_id,
    amount: data.amount,
    currency: data.currency,
    description: data.description,
    title: data.title,
    paymentMethods: data.payment_methods,
    type: data.type || 'one-off'
  };
}

export function offerToData(offer: Offer): OfferData {
  return {
    offer_id: offer.offerId,
    amount: offer.amount,
    currency: offer.currency,
    description: offer.description,
    title: offer.title,
    payment_methods: offer.paymentMethods,
    type: offer.type || 'one-off'
  };
}

export function dataToL402Offers(data: L402OffersData): L402Offers {
  return {
    offers: data.offers.map(dataToOffer),
    paymentContextToken: data.payment_context_token,
    paymentRequestUrl: data.payment_request_url,
    version: data.version
  };
}

export function l402OffersToData(offers: L402Offers): L402OffersData {
  return {
    offers: offers.offers.map(offerToData),
    payment_context_token: offers.paymentContextToken,
    payment_request_url: offers.paymentRequestUrl,
    version: offers.version
  };
}

// Function to stringify L402Offers for display purposes
export function stringifyL402Offers(offers: L402Offers): string {
  const offersStr = offers.offers.map(o => `- ${o.title} (${o.amount / 100} ${o.currency})`).join('\n');
  return `L402 Offers:\n${offersStr}\nPayment URL: ${offers.paymentRequestUrl}\nContext Token: ${offers.paymentContextToken}`;
}

// Main Fewsats client class
export class Fewsats {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor({ apiKey, baseUrl = 'https://api.fewsats.com' }: FewsatsOptions = {}) {
    const key = apiKey || process.env.FEWSATS_API_KEY;
    if (!key) {
      throw new Error('The apiKey must be set either by passing apiKey to the client or by setting the FEWSATS_API_KEY environment variable');
    }

    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Token ${key}`,
        'Content-Type': 'application/json'
      }
    });
  }

  private async request<T>(method: string, path: string, data?: any, timeout: number = 10000): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.request({
        method,
        url: path,
        data,
        timeout
      });
      return response.data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Request failed');
    }
  }

  async me(): Promise<UserInfo> {
    return this.request<UserInfo>('GET', '/v0/users/me');
  }

  async balance(): Promise<Balance[]> {
    return this.request<Balance[]>('GET', '/v0/wallets');
  }

  async paymentMethods(): Promise<PaymentMethod[]> {
    return this.request<PaymentMethod[]>('GET', '/v0/stripe/payment-methods');
  }

  async createOffers(offers: Offer[]): Promise<CreatedOffer> {
    const apiOffers = offers.map(offerToData);
    const res = await this.request<CreatedOfferData>('POST', '/v0/l402/offers', { offers: apiOffers });
    return {
      paymentContextToken: res.payment_context_token,
      paymentRequestUrl: res.payment_request_url,
      version: res.version,
      offers: res.offers.map(dataToOffer)
    };
  }

  async getPaymentDetails(
    paymentRequestUrl: string,
    offerId: string,
    paymentMethod: string,
    paymentContextToken: string
  ): Promise<PaymentDetails> {
    const response = await axios.post(paymentRequestUrl, {
        offer_id: offerId,
        payment_method: paymentMethod,
        payment_context_token: paymentContextToken,
      });
    
    const data = response.data;
    return {
      expiresAt: data.expires_at,
      offerId: data.offer_id,
      paymentRequest: data.payment_request,
      version: data.version
    };
  }

  async getPaymentStatus(paymentContextToken: string): Promise<PaymentStatus> {
    const result = await this.request<PaymentStatusData>('GET', `/v0/l402/payment-status?payment_context_token=${paymentContextToken}`);
    return {
      status: result.status,
      paidAt: result.paid_at,
      amount: result.amount,
      currency: result.currency,
      offerId: result.offer_id,
      paymentContextToken: result.payment_context_token
    };
  }

  async setWebhook(webhookUrl: string): Promise<any> {
    return this.request('POST', '/v0/users/webhook/set', { webhook_url: webhookUrl });
  }

  async payLightning(
    invoice: string,
    amount: number,
    currency: string = 'USD',
    description: string = ''
  ): Promise<any> {
    return this.request('POST', '/v0/l402/purchases/lightning', {
      invoice,
      amount,
      currency,
      description
    });
  }

  async payOffer(offerId: string, l402Offer: L402Offers): Promise<PaymentResponse> {
    const offerJson = l402OffersToData(l402Offer);
    const result = await this.request<PaymentResponseData>(
      'POST',
      '/v0/l402/purchases/from-offer',
      { offer_id: offerId, ...offerJson },
      30000
    );
    
    return this.mapPaymentResponseData(result);
  }

  async paymentInfo(pid: string): Promise<PaymentResponse> {
    const result = await this.request<PaymentResponseData>('GET', `/v0/l402/outgoing-payments/${pid}`);
    return this.mapPaymentResponseData(result);
  }
  
  private mapPaymentResponseData(data: PaymentResponseData): PaymentResponse {
    return {
      id: data.id,
      status: data.status,
      createdAt: data.created_at,
      paymentMethod: data.payment_method,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      invoice: data.invoice,
      isTest: data.is_test,
      paymentContextToken: data.payment_context_token,
      paymentRequestUrl: data.payment_request_url,
      preimage: data.preimage,
      title: data.title,
      type: data.type
    };
  }
}
