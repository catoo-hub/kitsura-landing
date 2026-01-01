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

import {
  MOCK_USER_DATA,
  MOCK_PAYMENT_METHODS,
  MOCK_PURCHASE_OPTIONS,
} from "./mock-data";

const API_BASE = "https://miniapp.kitsura.fun/miniapp";

// Helper to simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const miniappApi = {
  async fetchAppConfig(): Promise<any> {
    try {
      const response = await fetch("/app-config.json");
      if (!response.ok) {
        throw new Error("Failed to load app config");
      }
      return await response.json();
    } catch (error) {
      console.error("Error loading app config:", error);
      return null;
    }
  },

  async fetchSubscription(initData: string): Promise<UserData> {
    // If no initData (browser dev), return mock immediately
    if (!initData) {
      console.log("Dev mode: returning mock user data");
      await delay(800);
      return MOCK_USER_DATA;
    }

    const response = await fetch(`${API_BASE}/subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch subscription data");
    }

    return response.json();
  },

  async fetchPaymentMethods(initData: string): Promise<PaymentMethod[]> {
    if (!initData) {
      await delay(500);
      return MOCK_PAYMENT_METHODS;
    }

    const response = await fetch(`${API_BASE}/payments/methods`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch payment methods");
    }

    const data = await response.json();
    return data.methods || [];
  },

  async createPayment(
    initData: string,
    methodId: string,
    amountKopeks?: number,
    option?: string
  ): Promise<CreatePaymentResponse> {
    const payload: any = {
      initData,
      method: methodId,
    };

    if (amountKopeks) {
      payload.amountKopeks = amountKopeks;
    }

    if (option) {
      payload.option = option;
    }

    const response = await fetch(`${API_BASE}/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || errorData.message || "Failed to create payment"
      );
    }

    return response.json();
  },

  async fetchPurchaseOptions(initData: string): Promise<PurchaseOptions> {
    if (!initData) {
      await delay(600);
      return MOCK_PURCHASE_OPTIONS;
    }

    const response = await fetch(`${API_BASE}/subscription/purchase/options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch purchase options");
    }

    const data = await response.json();
    const root = data.data || data;
    return {
      currency: root.currency || "RUB",
      balance_kopeks: root.balance_kopeks ?? root.balanceKopeks ?? 0,
      periods: root.periods || root.available_periods || [],
      servers: root.servers ||
        root.countries || { available: [], min: 0, max: 0 },
    };
  },

  async purchaseSubscription(
    initData: string,
    periodId: string | number,
    selection?: any
  ): Promise<any> {
    const body: any = {
      initData,
      selection: { periodId, ...selection },
    };

    const response = await fetch(`${API_BASE}/subscription/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          errorData.detail ||
          "Failed to purchase subscription"
      );
    }

    return response.json();
  },

  async fetchMaintenanceStatus(
    initData: string
  ): Promise<{ isActive: boolean; message?: string }> {
    const response = await fetch(`${API_BASE}/maintenance/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ initData }),
    });

    if (response.ok) {
      return response.json();
    }
    return { isActive: false };
  },

  async activatePromoCode(initData: string, code: string): Promise<any> {
    const response = await fetch(`${API_BASE}/promo-codes/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData, code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail?.message ||
          errorData.message ||
          "Failed to activate promo code"
      );
    }

    return response.json();
  },

  async toggleAutoPay(
    initData: string,
    enabled: boolean,
    subscriptionId?: number
  ): Promise<any> {
    const response = await fetch(`${API_BASE}/subscription/autopay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData,
        enabled,
        subscription_id: subscriptionId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update autopay settings");
    }

    return response.json();
  },

  async calculatePurchasePreview(
    initData: string,
    selection: any
  ): Promise<any> {
    const response = await fetch(`${API_BASE}/subscription/purchase/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData,
        selection,
        ...selection,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to calculate price");
    }

    return response.json();
  },
};
