import { useState, useCallback } from "react";
import { normalizeUserData, normalizeUrl } from "../lib/legacy-logic";
import { MOCK_USER_DATA } from "../lib/mock-data";

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchUser = useCallback(async (initData: string, silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    // Dev mode fallback
    if (!initData) {
      console.log("Dev mode: returning mock user data");
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setUser(MOCK_USER_DATA);
      if (!silent) setLoading(false);
      return MOCK_USER_DATA;
    }

    try {
      const response = await fetch("/miniapp/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ initData }),
      });

      if (response.ok) {
        const payload = await response.json();
        const normalized = normalizeUserData(payload);
        setUser(normalized);
        return normalized;
      }

      // Error handling logic ported from fetchSubscriptionPayload
      let detail =
        response.status === 401
          ? "Authorization failed. Please open the mini app from Telegram."
          : "Subscription not found";
      let title =
        response.status === 401
          ? "Authorization Error"
          : "Subscription Not Found";
      let purchaseUrl = null;
      let code = null;

      try {
        const errorPayload = await response.json();
        if (errorPayload?.detail) {
          if (typeof errorPayload.detail === "string") {
            detail = errorPayload.detail;
          } else if (typeof errorPayload.detail === "object") {
            if (typeof errorPayload.detail.message === "string") {
              detail = errorPayload.detail.message;
            }
            if (typeof errorPayload.detail.title === "string") {
              title = errorPayload.detail.title;
            }
            if (typeof errorPayload.detail.code === "string") {
              code = errorPayload.detail.code;
            }
            purchaseUrl =
              errorPayload.detail.purchase_url ||
              errorPayload.detail.purchaseUrl ||
              purchaseUrl;
          }
        } else if (typeof errorPayload?.message === "string") {
          detail = errorPayload.message;
        }

        if (typeof errorPayload?.title === "string") {
          title = errorPayload.title;
        }

        if (!code && typeof errorPayload?.code === "string") {
          code = errorPayload.code;
        }

        purchaseUrl =
          purchaseUrl ||
          errorPayload?.purchase_url ||
          errorPayload?.purchaseUrl ||
          null;
      } catch (parseError) {
        // ignore JSON parsing errors
      }

      const errorObject: any = {
        title,
        message: detail,
        status: response.status,
      };
      if (code) errorObject.code = code;
      const normalizedPurchaseUrl = normalizeUrl(purchaseUrl);
      if (normalizedPurchaseUrl)
        errorObject.purchaseUrl = normalizedPurchaseUrl;

      throw errorObject;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  return {
    user,
    loading,
    error,
    fetchUser,
  };
}
