import { useState, useCallback } from "react";
import {
  AutopayState,
  mergeAutopaySources,
  normalizeAutopayPayload,
  parseJsonSafe,
} from "../lib/legacy-logic";

export function useSubscriptionAutopay() {
  const [state, setState] = useState<
    AutopayState & { loading: boolean; saving: boolean }
  >({
    enabled: undefined,
    daysBefore: null,
    defaultDaysBefore: null,
    options: [],
    loading: false,
    saving: false,
  });

  const ingestAutopayData = useCallback((...sources: any[]) => {
    const candidates = sources.filter(Boolean);
    if (!candidates.length) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    const normalized = mergeAutopaySources(...candidates);
    if (!normalized) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    setState((prev) => {
      const next = { ...prev };

      if (typeof normalized.enabled === "boolean") {
        next.enabled = normalized.enabled;
      }

      if (
        normalized.daysBefore !== null &&
        normalized.daysBefore !== undefined
      ) {
        next.daysBefore = normalized.daysBefore;
      }

      if (normalized.defaultDaysBefore !== undefined) {
        if (normalized.defaultDaysBefore !== null) {
          next.defaultDaysBefore = normalized.defaultDaysBefore;
        } else if (next.defaultDaysBefore === undefined) {
          next.defaultDaysBefore = null;
        }
      } else if (
        (next.defaultDaysBefore === null ||
          next.defaultDaysBefore === undefined) &&
        normalized.daysBefore !== null &&
        normalized.daysBefore !== undefined
      ) {
        next.defaultDaysBefore = normalized.daysBefore;
      }

      next.options = Array.isArray(normalized.options)
        ? normalized.options.slice().sort((a, b) => a - b)
        : [];

      if (
        (next.daysBefore === null || next.daysBefore === undefined) &&
        next.options.length
      ) {
        next.daysBefore = next.options[0];
      }

      next.loading = false;
      return next;
    });
  }, []);

  const updateAutopaySettings = useCallback(
    async (
      initData: string,
      subscriptionId: string,
      updates: { enabled?: boolean; daysBefore?: number }
    ) => {
      if (state.loading || state.saving) return;

      const previousState = { ...state };

      // Optimistic update
      const targetEnabled =
        updates.enabled !== undefined ? updates.enabled : state.enabled;
      let targetDays =
        updates.daysBefore !== undefined
          ? updates.daysBefore
          : state.daysBefore;

      if (targetEnabled && (targetDays === null || targetDays === undefined)) {
        targetDays =
          state.defaultDaysBefore ??
          (state.options.length ? state.options[0] : null);
      }

      if (targetEnabled && (targetDays === null || targetDays === undefined)) {
        // Error: No days available
        return;
      }

      setState((prev) => ({
        ...prev,
        enabled: targetEnabled,
        daysBefore: targetDays,
        defaultDaysBefore: prev.defaultDaysBefore ?? targetDays,
        saving: true,
      }));

      try {
        const payload = {
          initData,
          subscription_id: subscriptionId,
          subscriptionId,
          enabled: targetEnabled,
          days_before: targetDays,
          daysBefore: targetDays,
        };

        const response = await fetch("/miniapp/subscription/autopay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const body = await parseJsonSafe(response);
        if (!response.ok || (body && body.success === false)) {
          throw new Error(body?.message || "Failed to update autopay settings");
        }

        setState((prev) => ({ ...prev, saving: false }));

        if (body && typeof body === "object") {
          ingestAutopayData(
            body.autopay ||
              body.data ||
              body.subscription ||
              body.settings ||
              body
          );
        }
      } catch (error) {
        console.error("Autopay update failed", error);
        setState({ ...previousState, saving: false });
        // Handle error (toast?)
      }
    },
    [state, ingestAutopayData]
  );

  return {
    autopayState: state,
    ingestAutopayData,
    updateAutopaySettings,
  };
}
