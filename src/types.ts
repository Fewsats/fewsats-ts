export interface FewsatsOptions {
  apiKey?: string;
  baseUrl?: string;
}

export interface Offer {
  offerId: string;
  amount: number;
  currency: string;
  description: string;
  title: string;
  paymentMethods?: string[];
  type?: string;
}

export interface L402Offers {
  offers: Offer[];
  paymentContextToken: string;
  paymentRequestUrl: string;
  version: string;
}

export interface PaymentDetailsOptions {
  paymentRequestUrl: string;
  offerId: string;
  paymentMethod: string;
  paymentContextToken: string;
}

export interface PaymentPreview {
  amount: number;
  currency: string;
  [key: string]: any;
}

export interface OfferCreateRequest {
  offers: Partial<Offer>[];
}

export interface PayLightningRequest {
  invoice: string;
  amount: number;
  currency?: string;
  description?: string;
}

export interface ApiResponse {
  [key: string]: any;
} 