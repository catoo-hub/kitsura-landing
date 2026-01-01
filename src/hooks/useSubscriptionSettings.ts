import { useState, useCallback } from "react";
import {
  normalizeSubscriptionSettings,
  createError,
  extractSettingsError,
  parseJsonSafe,
  isSameSet,
} from "@/lib/legacy-logic";
import { UserData } from "@/lib/types";
import { API_BASE } from "@/lib/utils";

export interface SubscriptionSettingsSelections {
  servers: Set<string>;
  traffic: number | null;
  devices: number | null;
}

export function useSubscriptionSettings(
  userData: UserData | null,
  initData: string
) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selections, setSelections] = useState<SubscriptionSettingsSelections>({
    servers: new Set(),
    traffic: null,
    devices: null,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const ensureData = useCallback(
    async (force = false) => {
      if (!force && data) return data;
      if (!initData) return null;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/subscription/settings`, {
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

        const normalized = normalizeSubscriptionSettings(body, userData);
        setData(normalized);

        // Initialize selections
        setSelections({
          servers: normalized.current.serverSet,
          traffic: normalized.traffic.currentValue,
          devices: normalized.devices.current,
        });

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

  const updateServers = useCallback(async () => {
    if (actionLoading || !data || !initData) return;

    const selected = Array.from(selections.servers);
    const currentSet = data.current.serverSet;

    if (isSameSet(selections.servers, currentSet)) return;

    setActionLoading("servers");
    try {
      const payload = {
        initData,
        servers: selected,
        subscription_id: data.subscriptionId,
      };

      const response = await fetch(`${API_BASE}/subscription/servers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await parseJsonSafe(response);
      if (!response.ok || (body && body.success === false)) {
        throw createError("Error", extractSettingsError(body, response.status));
      }

      await ensureData(true);
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, data, initData, selections.servers, ensureData]);

  const updateTraffic = useCallback(async () => {
    if (actionLoading || !data || !initData) return;

    const selected = selections.traffic;
    if (selected === data.traffic.currentValue) return;

    setActionLoading("traffic");
    try {
      const payload = {
        initData,
        traffic: selected,
        subscription_id: data.subscriptionId,
      };

      const response = await fetch(`${API_BASE}/subscription/traffic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await parseJsonSafe(response);
      if (!response.ok || (body && body.success === false)) {
        throw createError("Error", extractSettingsError(body, response.status));
      }

      await ensureData(true);
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, data, initData, selections.traffic, ensureData]);

  const updateDevices = useCallback(async () => {
    if (actionLoading || !data || !initData) return;

    const selected = selections.devices;
    if (selected === data.devices.current) return;

    setActionLoading("devices");
    try {
      const payload = {
        initData,
        devices: selected,
        subscription_id: data.subscriptionId,
      };

      const response = await fetch(`${API_BASE}/subscription/devices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await parseJsonSafe(response);
      if (!response.ok || (body && body.success === false)) {
        throw createError("Error", extractSettingsError(body, response.status));
      }

      await ensureData(true);
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, data, initData, selections.devices, ensureData]);

  const toggleServer = useCallback((uuid: string) => {
    setSelections((prev) => {
      const newSet = new Set(prev.servers);
      if (newSet.has(uuid)) newSet.delete(uuid);
      else newSet.add(uuid);
      return { ...prev, servers: newSet };
    });
  }, []);

  const setTraffic = useCallback((value: number) => {
    setSelections((prev) => ({ ...prev, traffic: value }));
  }, []);

  const setDevices = useCallback((value: number) => {
    setSelections((prev) => ({ ...prev, devices: value }));
  }, []);

  return {
    data,
    loading,
    error,
    selections,
    actionLoading,
    ensureData,
    updateServers,
    updateTraffic,
    updateDevices,
    toggleServer,
    setTraffic,
    setDevices,
  };
}
