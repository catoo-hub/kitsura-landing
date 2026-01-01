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

export interface SubscriptionPurchaseSelections {
  periodId: string | null;
  trafficValue: number | null;
  servers: Set<string>;
  devices: number | null;
}

export function useSubscriptionPurchase(
  userData: UserData | null,
  initData: string
) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selections, setSelections] = useState<SubscriptionPurchaseSelections>({
    periodId: null,
    trafficValue: null,
    servers: new Set(),
    devices: null,
  });
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
        const response = await fetch("/miniapp/subscription/purchase/options", {
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

        const normalized = normalizeSubscriptionPurchasePayload(body, userData);
        setData(normalized);

        // Reset selections based on new data
        const newSelections: SubscriptionPurchaseSelections = {
          periodId: null,
          trafficValue: null,
          servers: new Set(),
          devices: null,
        };

        if (normalized.periods?.length) {
          newSelections.periodId = resolvePurchasePeriodId(
            normalized.periods[0]
          );
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
    [initData, userData, data]
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

      // Validate selections (simplified)
      // ensureSubscriptionPurchaseSelectionsValidForPeriod(period, selections, data, userData);

      const selectionPayload = buildSubscriptionPurchaseSelectionPayload(
        period,
        selections
      );

      setPreviewLoading(true);
      setPreviewError(null);

      try {
        const payload = {
          initData,
          subscription_id: userData?.subscription_url ? "existing" : null, // Mock ID logic
          selection: selectionPayload,
          ...selectionPayload,
        };

        const response = await fetch("/miniapp/subscription/purchase/preview", {
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

        const normalized = normalizeSubscriptionPurchasePreview(
          body,
          data,
          userData
        );
        setPreview(normalized);
      } catch (err: any) {
        setPreviewError(err);
      } finally {
        setPreviewLoading(false);
      }
    },
    [data, initData, selections, userData, getSelectedPeriod]
  );

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
    setSelections((prev) => ({ ...prev, trafficValue: value }));
  }, []);

  const toggleServer = useCallback((uuid: string) => {
    setSelections((prev) => {
      const newSet = new Set(prev.servers);
      if (newSet.has(uuid)) newSet.delete(uuid);
      else newSet.add(uuid);
      return { ...prev, servers: newSet };
    });
  }, []);

  const setDevices = useCallback((count: number) => {
    setSelections((prev) => ({ ...prev, devices: count }));
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

      const selectionPayload = buildSubscriptionPurchaseSelectionPayload(
        period,
        effectiveSelections
      );

      setSubmitting(true);
      try {
        const payload = {
          initData,
          subscription_id: userData?.subscription_url ? "existing" : null,
          selection: selectionPayload,
          ...selectionPayload,
        };

        const response = await fetch("/miniapp/subscription/purchase", {
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
    [submitting, data, initData, getSelectedPeriod, selections, userData]
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
