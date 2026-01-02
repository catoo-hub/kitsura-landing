import {
  UserData,
  PaymentMethod,
  CreatePaymentResponse,
  PurchaseOptions,
  PurchasePeriod,
  PurchaseServer,
  ReferralUser,
} from "./types";

export type {
  UserData,
  PaymentMethod,
  CreatePaymentResponse,
  PurchaseOptions,
  PurchasePeriod,
  PurchaseServer,
  ReferralUser,
};

import {
  MOCK_USER_DATA,
  MOCK_PAYMENT_METHODS,
  MOCK_PURCHASE_OPTIONS,
} from "./mock-data";
import { API_BASE } from "./utils";

// Helper to simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const miniappApi = {
  async fetchAppConfig(): Promise<any> {
    try {
      // Try multiple known paths to avoid 404 on different deployments
      const candidateUrls = [
        `${API_BASE}/app-config.json`,
        `/miniapp/app-config.json`,
        `/app-config.json`,
      ];

      for (const url of candidateUrls) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            return await response.json();
          }
        } catch (e) {
          // try next
        }
      }

      throw new Error("Failed to load app config");
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
      traffic: root.traffic ||
        root.traffic_options ||
        root.trafficOptions || { available: [], options: [] },
      servers: root.servers ||
        root.countries || { available: [], options: [], min: 0, max: 0 },
      devices: root.devices || root.device_options || root.deviceOptions || {},
    } as any;
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

  async removeDevice(initData: string, hwid: string): Promise<any> {
    const payload = { initData, hwid };
    const response = await fetch(`${API_BASE}/devices/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok || body?.success === false) {
      const message =
        body?.message ||
        body?.detail?.message ||
        body?.detail ||
        "Failed to reset device";
      throw new Error(message);
    }

    return body;
  },

  async fetchReferrals(initData: string): Promise<ReferralUser[]> {
    const mockReferrals = [
      {
        id: 1,
        username: "user_one",
        first_name: "user_one",
        status: "Активен",
        earned: 0,
        topups: 1,
        registration_date: "17 дек. 2025 г.",
        last_activity: "17 дек. 2025 г.",
      },
    ];

    if (!initData) {
      await delay(500);
      return mockReferrals;
    }

    try {
      const response = await fetch(`${API_BASE}/referrals/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });

      if (!response.ok) {
        console.warn("Failed to fetch referrals, using mock");
        return mockReferrals;
      }

      const data = await response.json();
      return data.referrals || [];
    } catch (e) {
      console.warn("Error fetching referrals, using mock", e);
      return mockReferrals;
    }
  },
};
