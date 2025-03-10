export interface FewsatsOptions {
  apiKey?: string;
  baseUrl?: string;
}

// API data types (snake_case)
export interface OfferData {
  offer_id: string;
  amount: number;
  currency: string;
  description: string;
  title: string;
  payment_methods?: string[];
  type?: string;
}

export interface L402OffersData {
  offers: OfferData[];
  payment_context_token: string;
  payment_request_url: string;
  version: string;
}

// Client types (camelCase)
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

// Output types

export interface UserInfo {
  id: string
  email: string
  created_at: string
}

export interface Balance {
  currency: string
  balance: number
}

export interface PaymentMethod {
  id: string | number
  type?: string
  last4?: string
  brand?: string
  exp_month?: number
  exp_year?: number
  is_default?: boolean
}

// API response data types (snake_case)
export interface CreatedOfferData {
  payment_context_token: string
  payment_request_url: string
  version: string
  offers: OfferData[]
}

export interface PaymentDetailsData {
  expires_at: string
  offer_id: string
  payment_request: {
    [key: string]: any
  }
  version: string
}

export interface PaymentStatusData {
  status: string
  paid_at?: string
  amount?: number | null
  currency?: string | null
  offer_id?: string | null
  payment_context_token?: string
}

export interface PaymentResponseData {
  id: string | number
  status: string
  created_at?: string
  payment_method?: string
  amount?: number
  currency?: string
  description?: string
  invoice?: string
  is_test?: boolean
  payment_context_token?: string
  payment_request_url?: string
  preimage?: string
  title?: string
  type?: string
}

// Client response types (camelCase)
export interface CreatedOffer {
  paymentContextToken: string
  paymentRequestUrl: string
  version: string
  offers: Offer[]
}

export interface PaymentDetails {
  expiresAt: string
  offerId: string
  paymentRequest: {
    [key: string]: any
  }
  version: string
}

export interface PaymentStatus {
  status: string
  paidAt?: string
  amount?: number | null
  currency?: string | null
  offerId?: string | null
  paymentContextToken?: string
}

export interface PaymentResponse {
  id: string | number
  status: string
  createdAt?: string
  paymentMethod?: string
  amount?: number
  currency?: string
  description?: string
  invoice?: string
  isTest?: boolean
  paymentContextToken?: string
  paymentRequestUrl?: string
  preimage?: string
  title?: string
  type?: string
}