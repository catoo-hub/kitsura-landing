import { useState, useCallback, useEffect, useRef } from "react";
import {
  ensureSubscriptionPurchaseSelectionsValidForPeriod,
  buildSubscriptionPurchaseSelectionPayload,
  normalizeSubscriptionPurchasePayload,
  normalizeSubscriptionPurchasePreview,
  getSubscriptionPurchaseTrafficConfig,
  getSubscriptionPurchaseServersConfig,
  getSubscriptionPurchaseDevicesConfig,
  resolvePurchasePeriodId,
  createError,
  extractSettingsError,
  parseJsonSafe,
  t,
} from "@/lib/legacy-logic";
import { UserData } from "@/lib/types";
import { API_BASE } from "@/lib/utils";

export interface SubscriptionPurchaseSelections {
  periodId: string | null;
  trafficValue: number | null;
  servers: Set<string>;
  devices: number | null;
}

export function useSubscriptionPurchase(
  userData: UserData | null,
  initData: string,
  options?: { forceMode?: "renewal" | "purchase" }
) {
  const isRenewalMode =
    options?.forceMode === "purchase"
      ? false
      : options?.forceMode === "renewal"
      ? true
      : Boolean(
          userData &&
            userData.subscription_missing === false &&
            (userData.user?.subscription_actual_status === "active" ||
              userData.user?.subscription_status === "active")
        );
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selections, setSelections] = useState<SubscriptionPurchaseSelections>({
    periodId: null,
    trafficValue: null,
    servers: new Set(),
    devices: 1,
  });

  // Reset data when mode changes to ensure we fetch the correct options (renewal vs purchase)
  useEffect(() => {
    setData(null);
    setSelections({
      periodId: null,
      trafficValue: null,
      servers: new Set(),
      devices: 1,
    });
  }, [isRenewalMode]);
  const [preview, setPreview] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<Error | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getSelectedPeriod = useCallback(() => {
    if (!data?.periods) return null;
    const selectedId = selections.periodId;
    if (selectedId) {
      return (
        data.periods.find(
          (p: any) => resolvePurchasePeriodId(p) === selectedId
        ) || data.periods[0]
      );
    }
    return data.periods[0];
  }, [data, selections.periodId]);

  const ensureData = useCallback(
    async (force = false) => {
      if (!force && data) return data;
      if (!initData) return null;

      setLoading(true);
      setError(null);

      try {
        const optionEndpoints = isRenewalMode
          ? [
              `${API_BASE}/subscription/renewal/options`,
              `${API_BASE}/subscription/purchase/options`,
            ]
          : [`${API_BASE}/subscription/purchase/options`];

        let normalized: any = null;
        let lastError: Error | null = null;
        for (const endpoint of optionEndpoints) {
          try {
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ initData }),
            });
            const body = await parseJsonSafe(response);
            if (!response.ok || (body && body.success === false)) {
              throw createError(
                "Error",
                extractSettingsError(body, response.status)
              );
            }
            normalized = normalizeSubscriptionPurchasePayload(body, userData);
            lastError = null;
            break;
          } catch (err: any) {
            lastError = err;
          }
        }

        if (lastError) {
          throw lastError;
        }

        setData(normalized);

        // Reset selections based on new data
        const newSelections: SubscriptionPurchaseSelections = {
          periodId: null,
          trafficValue: null,
          servers: new Set(),
          devices: 1,
        };

        if (normalized.periods?.length) {
          newSelections.periodId = resolvePurchasePeriodId(
            normalized.periods[0]
          );
          // Fill defaults from config so preview is not zeroed
          ensureSubscriptionPurchaseSelectionsValidForPeriod(
            normalized.periods[0],
            newSelections,
            normalized,
            userData
          );
          newSelections.devices = 1;
        }

        // Apply defaults from normalized data if available (logic from resetSubscriptionPurchaseSelections)
        // ... (Simplified for now, can be expanded)

        setSelections(newSelections);
        return normalized;
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [initData, userData, data, isRenewalMode]
  );

  const updatePreview = useCallback(
    async (immediate = false) => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
        previewTimeoutRef.current = null;
      }

      if (!immediate) {
        previewTimeoutRef.current = setTimeout(() => updatePreview(true), 500);
        return;
      }

      if (!data || !initData) return;

      const period = getSelectedPeriod();
      if (!period) return;

      // Ensure selections are compatible with the selected period
      const patchedSelections = { ...selections } as any;
      ensureSubscriptionPurchaseSelectionsValidForPeriod(
        period,
        patchedSelections,
        data,
        userData
      );
      patchedSelections.devices = 1;

      const selectionPayload = buildSubscriptionPurchaseSelectionPayload(
        period,
        patchedSelections
      );

      setPreviewLoading(true);
      setPreviewError(null);

      try {
        const subscriptionId =
          data?.subscriptionId ||
          userData?.subscription_id ||
          userData?.subscriptionId ||
          null;

        const payload = {
          initData,
          subscription_id: subscriptionId,
          subscriptionId,
          selection: selectionPayload,
          ...selectionPayload,
        };

        const hasActiveSubscription =
          userData &&
          userData.subscription_missing === false &&
          (userData.user?.subscription_actual_status === "active" ||
            userData.user?.subscription_status === "active");

        const attempts = isRenewalMode
          ? [
              {
                url: `${API_BASE}/subscription/renewal/preview`,
                useSubId: true,
              },
              {
                url: `${API_BASE}/subscription/purchase/preview`,
                useSubId: false,
              },
            ]
          : [
              // If we are in purchase mode (e.g. constructor) but user has active sub, try renewal preview first to get upgrade price
              ...(hasActiveSubscription
                ? [
                    {
                      url: `${API_BASE}/subscription/renewal/preview`,
                      useSubId: true,
                    },
                  ]
                : []),
              {
                url: `${API_BASE}/subscription/purchase/preview`,
                useSubId: false, // Force false for purchase mode to avoid "Not enough funds" if subId is accidentally passed
              },
            ];

        let lastError: Error | null = null;
        for (const attempt of attempts) {
          try {
            const currentPayload = attempt.useSubId
              ? payload
              : {
                  ...payload,
                  subscription_id: undefined,
                  subscriptionId: undefined,
                  // If we are stripping subId (fallback to new purchase), we MUST ensure traffic/servers are set.
                  // If selections are empty (e.g. in renewal mode where options were hidden), try to infer from userData.
                  selection: {
                    ...payload.selection,
                    traffic_value:
                      payload.selection?.traffic_value ??
                      (userData?.user?.traffic_limit
                        ? Math.round(
                            userData.user.traffic_limit / (1024 * 1024 * 1024)
                          )
                        : undefined),
                    servers:
                      payload.selection?.servers?.length > 0
                        ? payload.selection.servers
                        : userData?.subscription?.servers?.map(
                            (s: any) => s.uuid || s.id
                          ) || [],
                  },
                };

            const response = await fetch(attempt.url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(currentPayload),
            });
            const body = await parseJsonSafe(response);
            if (!response.ok || (body && body.success === false)) {
              throw createError(
                "Error",
                extractSettingsError(body, response.status)
              );
            }

            const normalized = normalizeSubscriptionPurchasePreview(
              body,
              data,
              userData
            );
            setPreview(normalized);
            lastError = null;
            break;
          } catch (err: any) {
            lastError = err;
          }
        }

        if (lastError) {
          // If all attempts failed, clear preview but don't throw to UI immediately unless critical
          // But we want to show 0 or fallback
          setPreview(null);
          // Don't set error to block UI, just let fallback price logic handle it
          // setPreviewError(lastError);
        }
      } catch (err: any) {
        setPreviewError(err);
      } finally {
        setPreviewLoading(false);
      }
    },
    [initData, userData, data, isRenewalMode, selections, getSelectedPeriod]
  );

  // Trigger preview update when selections change
  useEffect(() => {
    if (data && initData) {
      updatePreview();
    }
  }, [selections, data, initData]);

  // Effect to update preview when selections change
  useEffect(() => {
    if (data) {
      updatePreview(false);
    }
  }, [selections, data]);

  const selectPeriod = useCallback((periodId: string) => {
    setSelections((prev) => ({ ...prev, periodId }));
  }, []);

  const selectTraffic = useCallback((value: number) => {
    const numeric = Number.isFinite(value as any)
      ? Number(value)
      : Number(value);
    setSelections((prev) => ({ ...prev, trafficValue: numeric }));
  }, []);

  const toggleServer = useCallback((uuid: string) => {
    setSelections((prev) => {
      const newSet = new Set(prev.servers);
      if (newSet.has(uuid)) newSet.delete(uuid);
      else newSet.add(uuid);
      return { ...prev, servers: newSet };
    });
  }, []);

  const setDevices = useCallback(() => {
    setSelections((prev) => ({ ...prev, devices: 1 }));
  }, []);

  const submitPurchase = useCallback(
    async (periodId?: string | number) => {
      if (submitting || !data || !initData) return;

      let period;
      if (periodId) {
        period = data.periods.find(
          (p: any) => resolvePurchasePeriodId(p) === String(periodId)
        );
      } else {
        period = getSelectedPeriod();
      }

      if (!period) return;

      const effectiveSelections = { ...selections };
      if (periodId) {
        effectiveSelections.periodId = String(periodId);
      }

      // Ensure selections are valid for this period (fills defaults like traffic/servers)
      ensureSubscriptionPurchaseSelectionsValidForPeriod(
        period,
        effectiveSelections,
        data,
        userData
      );
      effectiveSelections.devices = 1;

      const selectionPayload = buildSubscriptionPurchaseSelectionPayload(
        period,
        effectiveSelections
      );

      setSubmitting(true);
      try {
        const subscriptionId =
          data?.subscriptionId ||
          userData?.subscription_id ||
          userData?.subscriptionId ||
          null;

        const payload = {
          initData,
          subscription_id: subscriptionId,
          subscriptionId,
          selection: selectionPayload,
          ...selectionPayload,
        };

        if (isRenewalMode) {
          payload.period_id =
            selectionPayload.period_id || selectionPayload.periodId;
          payload.periodId =
            selectionPayload.periodId || selectionPayload.period_id;
          payload.period_days = selectionPayload.period_days;
          payload.periodDays = selectionPayload.period_days;
        }

        const endpoint = isRenewalMode
          ? `${API_BASE}/subscription/renewal`
          : `${API_BASE}/subscription/purchase`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await parseJsonSafe(response);
        if (!response.ok || (body && body.success === false)) {
          throw createError(
            "Error",
            extractSettingsError(body, response.status)
          );
        }

        // Success
        return body;
      } catch (err) {
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [
      submitting,
      data,
      initData,
      getSelectedPeriod,
      selections,
      userData,
      isRenewalMode,
    ]
  );

  return {
    data,
    loading,
    error,
    selections,
    preview,
    previewLoading,
    previewError,
    submitting,
    ensureData,
    selectPeriod,
    selectTraffic,
    toggleServer,
    setDevices,
    submitPurchase,
    getSelectedPeriod,
  };
}
