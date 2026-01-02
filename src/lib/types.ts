export interface UserData {
  user: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    language_code?: string;
    language?: string;
    subscription_status?: string;
    subscription_actual_status?: string;
  };
  balance: number;
  balance_currency: string;
  subscription_url?: string;
  subscription_crypto_link?: string;
  subscription_missing: boolean;
  autopay?: boolean;
  trial_available: boolean;
  trial_duration_days?: number;
  referral?: {
    code: string;
    link: string;
    stats: {
      invited_count: number;
      earned_total: number;
      earned_month: number;
      balance: number;
    };
  };
  happ?: {
    link?: string;
    crypto_link?: string;
  };
  servers?: any[];
  devices?: any[];
}

export interface ReferralUser {
  id: number | string;
  username?: string;
  first_name?: string;
  last_name?: string;
  status: string;
  earned: number;
  topups: number;
  registration_date: string;
  last_activity: string;
}

export interface PaymentMethod {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  icon?: string;
  currency?: string;
  min_amount_kopeks?: number;
  max_amount_kopeks?: number;
  requires_amount?: boolean;
  options?: any[];
}

export interface CreatePaymentResponse {
  payment_url?: string;
  invoice_id?: string;
  status?: string;
}

export interface PurchasePeriod {
  id: string | number;
  name?: string;
  title?: string;
  label?: string;
  months?: number;
  days?: number;
  price_kopeks?: number;
  priceKopeks?: number;
  final_price_kopeks?: number;
  discount_percent?: number;
  is_best?: boolean;
  is_popular?: boolean;
  description?: string;
}

export interface PurchaseServer {
  uuid: string;
  name: string;
  country_code?: string;
  flag?: string;
  price_kopeks?: number;
  is_available?: boolean;
}

export interface PurchaseOptions {
  currency: string;
  balance_kopeks: number;
  periods: PurchasePeriod[];
  servers: {
    available: PurchaseServer[];
    min: number;
    max: number;
  };
}
