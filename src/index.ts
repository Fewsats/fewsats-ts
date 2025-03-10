// fewsats.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Interfaces for type safety
interface FewsatsConfig {
  apiKey?: string;
  baseUrl?: string;
}

interface OfferData {
  offer_id: string;
  amount: number;
  currency: string;
  description: string;
  title: string;
  payment_methods?: string[];
  type?: string;
}

interface L402OffersData {
  offers: OfferData[];
  payment_context_token: string;
  payment_request_url: string;
  version: string;
}

// Offer class
export class Offer {
  constructor(
    public offerId: string,
    public amount: number,
    public currency: string,
    public description: string,
    public title: string,
    public paymentMethods: string[] = [],
    public type: string = 'one-off'
  ) {}

  static from(data: OfferData): Offer {
    return new Offer(
      data.offer_id,
      data.amount,
      data.currency,
      data.description,
      data.title,
      data.payment_methods,
      data.type
    );
  }
}

// L402Offers class
export class L402Offers {
  constructor(
    public offers: Offer[],
    public paymentContextToken: string,
    public paymentRequestUrl: string,
    public version: string
  ) {}

  static from(data: L402OffersData): L402Offers {
    const offers = data.offers.map(offer => Offer.from(offer));
    return new L402Offers(offers, data.payment_context_token, data.payment_request_url, data.version);
  }

  toJSON(): L402OffersData {
    return {
      offers: this.offers.map(o => ({
        offer_id: o.offerId,
        amount: o.amount,
        currency: o.currency,
        description: o.description,
        title: o.title,
        payment_methods: o.paymentMethods,
        type: o.type
      })),
      payment_context_token: this.paymentContextToken,
      payment_request_url: this.paymentRequestUrl,
      version: this.version
    };
  }

  toString(): string {
    const offersStr = this.offers.map(o => `- ${o.title} (${o.amount / 100} ${o.currency})`).join('\n');
    return `L402 Offers:\n${offersStr}\nPayment URL: ${this.paymentRequestUrl}\nContext Token: ${this.paymentContextToken}`;
  }
}

// Main Fewsats client class
export class Fewsats {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor({ apiKey, baseUrl = 'https://api.fewsats.com' }: FewsatsConfig = {}) {
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

  async me(): Promise<any> {
    return this.request('GET', '/v0/users/me');
  }

  async balance(): Promise<any> {
    return this.request('GET', '/v0/wallets');
  }

  async paymentMethods(): Promise<any[]> {
    return this.request('GET', '/v0/stripe/payment-methods');
  }

  async createOffers(offers: OfferData[]): Promise<any> {
    return this.request('POST', '/v0/l402/offers', { offers });
  }

  async getPaymentDetails(
    paymentRequestUrl: string,
    offerId: string,
    paymentMethod: string, // lightning, credit_card, etc...
    paymentContextToken: string
  ): Promise<any> {
    return axios.post(paymentRequestUrl, {
      offer_id: offerId,
      payment_method: paymentMethod,
      payment_context_token: paymentContextToken
    });
  }

  async getPaymentStatus(paymentContextToken: string): Promise<any> {
    return this.request('GET', `/v0/l402/payment-status?payment_context_token=${paymentContextToken}`);
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

  async payOffer(offerId: string, l402Offer: L402Offers): Promise<any> {
    const offerJson = l402Offer.toJSON();
    return this.request('POST', '/v0/l402/purchases/from-offer', { offer_id: offerId, ...offerJson }, 30000);
  }

  async paymentInfo(pid: string): Promise<any> {
    return this.request('GET', `/v0/l402/outgoing-payments/${pid}`);
  }
}
