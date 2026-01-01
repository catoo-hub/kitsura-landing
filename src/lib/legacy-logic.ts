// Utility functions ported from index.html

export function ensureArray<T>(value: any): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [value];
}

export function coercePositiveInt(
  value: any,
  fallback: number | null = null
): number | null {
  if (value === null || value === undefined) {
    return fallback;
  }
  const parsed = parseInt(String(value), 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return fallback;
}

export function coerceBoolean(value: any, fallback: boolean = false): boolean {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (String(value).toLowerCase() === "true" || value === 1 || value === "1") {
    return true;
  }
  if (String(value).toLowerCase() === "false" || value === 0 || value === "0") {
    return false;
  }
  return fallback;
}

export function coerceNumber(
  value: any,
  fallback: number | null = null
): number | null {
  if (value === null || value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return fallback;
}

export function formatPriceFromKopeks(
  kopeks: number,
  currency: string = "RUB"
): string {
  if (kopeks === null || kopeks === undefined) {
    return "";
  }
  const amount = kopeks / 100;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTrafficLimit(gb: number): string {
  if (gb === null || gb === undefined) {
    return "";
  }
  if (gb <= 0) {
    return "Unlimited"; // Should use translation
  }
  return `${gb} GB`;
}

export function normalizeServerEntry(
  entry: any
): { uuid: string; name: string } | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const uuid = entry.uuid || entry.id || entry.server_id || entry.serverId;
  if (!uuid) {
    return null;
  }
  const name =
    entry.name ||
    entry.title ||
    entry.label ||
    entry.location ||
    entry.country ||
    uuid;
  return { uuid: String(uuid), name: String(name) };
}

export async function parseJsonSafe(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

export function createError(
  title: string,
  message: string,
  code: any = null
): Error & { title?: string; code?: any } {
  const error: any = new Error(message);
  error.title = title;
  error.code = code;
  return error;
}

export function extractSettingsError(payload: any, status: number): string {
  if (!payload || typeof payload !== "object") {
    return status === 401 ? "Unauthorized" : "Unknown error";
  }
  if (typeof payload.detail === "string") {
    return payload.detail;
  }
  if (payload.detail && typeof payload.detail.message === "string") {
    return payload.detail.message;
  }
  if (typeof payload.message === "string") {
    return payload.message;
  }
  return "Unknown error";
}

// Placeholder for translation
export function t(key: string): string {
  return key;
}

export function isSameSet<T>(setA: Set<T>, setB: Set<T>): boolean {
  if (setA.size !== setB.size) {
    return false;
  }
  for (const item of setA) {
    if (!setB.has(item)) {
      return false;
    }
  }
  return true;
}

export function normalizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.match(/^(https?|happ|tg|ton):/i)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

// --- Logic Functions ---

export function normalizeSubscriptionSettings(payload: any, userData: any) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload.settings || payload.data || payload;
  if (!root || typeof root !== "object") {
    return null;
  }

  const currentInfo = root.current || root.subscription || {};
  const serversInfo = root.servers || root.countries || {};
  const trafficInfo =
    root.traffic || root.traffic_options || root.trafficOptions || {};
  const devicesInfo =
    root.devices || root.device_options || root.deviceOptions || {};

  const currentServersRaw = ensureArray(
    currentInfo.servers ||
      currentInfo.connected_servers ||
      root.current_servers ||
      root.connected_servers ||
      userData?.connected_servers
  );
  const normalizedCurrentServers = currentServersRaw
    .map(normalizeServerEntry)
    .filter(Boolean);
  const serverSet = new Set(
    normalizedCurrentServers.map((server: any) => server.uuid).filter(Boolean)
  );

  const availableServersRaw = ensureArray(
    serversInfo.available ||
      serversInfo.options ||
      root.available_servers ||
      root.available_squads ||
      []
  );
  const normalizedAvailableServers = availableServersRaw
    .map((entry: any) => {
      const base = normalizeServerEntry(entry);
      if (!base) {
        return null;
      }
      return {
        uuid: base.uuid,
        name: base.name,
        priceKopeks: coercePositiveInt(
          entry.price_kopeks ?? entry.priceKopeks ?? entry.price ?? entry.cost,
          null
        ),
        priceLabel: entry.price_label || entry.priceLabel || null,
        discountPercent: coercePositiveInt(
          entry.discount_percent ?? entry.discountPercent ?? entry.discount,
          null
        ),
        isConnected: coerceBoolean(
          entry.is_connected ??
            entry.connected ??
            entry.isSelected ??
            entry.selected ??
            serverSet.has(base.uuid),
          false
        ),
        isAvailable: coerceBoolean(
          entry.is_available ??
            entry.available ??
            entry.enabled ??
            entry.selectable ??
            true,
          true
        ),
        disabledReason: entry.disabled_reason || entry.reason || null,
      };
    })
    .filter(Boolean);

  const trafficOptionsRaw = ensureArray(
    trafficInfo.options || root.available_traffic || root.traffic_options || []
  );
  const normalizedTrafficOptions = trafficOptionsRaw
    .map((option: any) => {
      const value = coerceNumber(
        option.value ??
          option.gb ??
          option.limit ??
          option.traffic_gb ??
          option.trafficGb,
        null
      );
      return {
        value,
        label:
          option.label ||
          option.title ||
          (value !== null ? formatTrafficLimit(value) : ""),
        priceKopeks: coercePositiveInt(
          option.price_kopeks ?? option.priceKopeks ?? option.price ?? null,
          null
        ),
        priceLabel: option.price_label || option.priceLabel || null,
        isCurrent: coerceBoolean(
          option.is_current ??
            option.current ??
            option.active ??
            value === trafficInfo.currentValue,
          false
        ),
        isAvailable: coerceBoolean(
          option.is_available ?? option.available ?? option.enabled ?? true,
          true
        ),
      };
    })
    .filter((opt: any) => opt.value !== null);

  const devicesOptionsRaw = ensureArray(
    devicesInfo.options || root.available_devices || root.device_options || []
  );
  const normalizedDevicesOptions = devicesOptionsRaw
    .map((option: any) => {
      const value = coercePositiveInt(
        option.value ?? option.count ?? option.limit ?? option.devices,
        null
      );
      return {
        value,
        label:
          option.label || option.title || (value !== null ? String(value) : ""),
        priceKopeks: coercePositiveInt(
          option.price_kopeks ?? option.priceKopeks ?? option.price ?? null,
          null
        ),
        priceLabel: option.price_label || option.priceLabel || null,
        isCurrent: coerceBoolean(
          option.is_current ??
            option.current ??
            option.active ??
            value === devicesInfo.current,
          false
        ),
        isAvailable: coerceBoolean(
          option.is_available ?? option.available ?? option.enabled ?? true,
          true
        ),
      };
    })
    .filter((opt: any) => opt.value !== null);

  return {
    subscriptionId:
      root.subscription_id ||
      root.subscriptionId ||
      payload.subscription_id ||
      payload.subscriptionId ||
      null,
    currency: (
      root.currency ||
      payload.currency ||
      userData?.balance_currency ||
      "RUB"
    )
      .toString()
      .toUpperCase(),
    current: {
      serverSet,
      trafficLabel:
        currentInfo.traffic_label ||
        currentInfo.trafficLabel ||
        (trafficInfo.currentValue !== undefined
          ? formatTrafficLimit(trafficInfo.currentValue)
          : ""),
      deviceLimit: coercePositiveInt(
        currentInfo.device_limit ??
          currentInfo.deviceLimit ??
          devicesInfo.current,
        0
      ),
    },
    servers: {
      available: normalizedAvailableServers,
      min: coercePositiveInt(serversInfo.min ?? serversInfo.min_selectable, 0),
      max: coercePositiveInt(serversInfo.max ?? serversInfo.max_selectable, 0),
      canUpdate: coerceBoolean(
        serversInfo.can_update ?? serversInfo.canUpdate,
        true
      ),
      hint: serversInfo.hint || null,
    },
    traffic: {
      options: normalizedTrafficOptions,
      currentValue: coerceNumber(
        trafficInfo.current_value ??
          trafficInfo.currentValue ??
          trafficInfo.current ??
          trafficInfo.value,
        null
      ),
      canUpdate: coerceBoolean(
        trafficInfo.can_update ?? trafficInfo.canUpdate,
        true
      ),
      hint: trafficInfo.hint || null,
    },
    devices: {
      options: normalizedDevicesOptions,
      current: coercePositiveInt(
        devicesInfo.current ?? devicesInfo.current_value ?? devicesInfo.value,
        0
      ),
      min: coercePositiveInt(devicesInfo.min ?? devicesInfo.min_selectable, 0),
      max: coercePositiveInt(devicesInfo.max ?? devicesInfo.max_selectable, 0),
      step: coercePositiveInt(devicesInfo.step, 1),
      canUpdate: coerceBoolean(
        devicesInfo.can_update ?? devicesInfo.canUpdate,
        true
      ),
      priceKopeks: coercePositiveInt(
        devicesInfo.price_kopeks ?? devicesInfo.priceKopeks,
        null
      ),
      hint: devicesInfo.hint || null,
    },
  };
}

export function resolvePurchasePrice(
  valueSources: any[],
  labelSources: any[],
  currency: string
) {
  for (const source of valueSources) {
    const value = coercePositiveInt(source, null);
    if (value !== null) {
      return {
        kopeks: value,
        label: formatPriceFromKopeks(value, currency),
      };
    }
  }

  for (const label of labelSources) {
    if (typeof label === "string" && label.trim().length) {
      return {
        kopeks: null,
        label,
      };
    }
  }

  return { kopeks: null, label: "" };
}

export function resolvePurchasePeriodDays(period: any) {
  if (!period || typeof period !== "object") {
    return null;
  }

  const dayFields = [
    "days",
    "period_days",
    "periodDays",
    "duration_days",
    "durationDays",
  ];
  for (const field of dayFields) {
    const value = coercePositiveInt(period[field], null);
    if (value !== null) {
      return value;
    }
  }

  const monthFields = ["months", "period_months", "periodMonths", "period"];
  for (const field of monthFields) {
    const value = coercePositiveInt(period[field], null);
    if (value !== null && value > 0) {
      return value * 30;
    }
  }

  return null;
}

export function formatPeriodLabel(months: number): string {
  // Simple mock implementation
  return `${months} months`;
}

export function resolvePurchasePeriodLabel(period: any) {
  if (!period) {
    return "";
  }
  if (typeof period.label === "string" && period.label.trim().length) {
    return period.label;
  }
  if (typeof period.title === "string" && period.title.trim().length) {
    return period.title;
  }
  const months = coercePositiveInt(
    period.months ??
      period.period ??
      period.period_months ??
      period.periodMonths,
    null
  );
  if (months) {
    return formatPeriodLabel(months);
  }
  const days = resolvePurchasePeriodDays(period);
  if (days) {
    const approxMonths = Math.max(1, Math.round(days / 30));
    return formatPeriodLabel(approxMonths);
  }
  return "";
}

export function resolvePurchasePeriodId(period: any) {
  if (!period || typeof period !== "object") {
    return null;
  }
  if (period.id !== undefined && period.id !== null) {
    return String(period.id);
  }
  if (period.period_id !== undefined && period.period_id !== null) {
    return String(period.period_id);
  }
  if (period.periodId !== undefined && period.periodId !== null) {
    return String(period.periodId);
  }
  if (period.code !== undefined && period.code !== null) {
    return String(period.code);
  }
  if (period.key !== undefined && period.key !== null) {
    return String(period.key);
  }
  const days = resolvePurchasePeriodDays(period);
  if (days !== null) {
    return `days:${days}`;
  }
  return null;
}

export function formatPurchaseTrafficLabel(option: any) {
  if (option == null) {
    return "";
  }
  if (typeof option === "string") {
    return option;
  }
  if (typeof option.label === "string" && option.label.trim().length) {
    return option.label;
  }
  const rawValue =
    option.value ??
    option.traffic ??
    option.limit ??
    option.amount ??
    option.gigabytes ??
    option.gb ??
    null;
  const numeric = coerceNumber(rawValue, null);
  if (numeric === null) {
    return rawValue != null ? String(rawValue) : "";
  }
  if (numeric <= 0) {
    const unlimited = t("subscription_purchase.traffic.unlimited");
    return unlimited === "subscription_purchase.traffic.unlimited"
      ? "Unlimited"
      : unlimited;
  }
  return formatTrafficLimit(numeric);
}

export function normalizePurchaseServerOption(option: any, currency: string) {
  if (!option) {
    return null;
  }
  const base = normalizeServerEntry(option);
  if (!base) {
    return null;
  }
  const uuid = base.uuid ? String(base.uuid) : null;
  const priceInfo = resolvePurchasePrice(
    [
      option.final_price_kopeks,
      option.finalPriceKopeks,
      option.total_price_kopeks,
      option.totalPriceKopeks,
      option.price_kopeks,
      option.priceKopeks,
      option.price,
      option.cost_kopeks,
      option.cost,
    ],
    [option.price_label, option.priceLabel],
    currency
  );
  const originalInfo = resolvePurchasePrice(
    [
      option.original_price_kopeks,
      option.originalPriceKopeks,
      option.base_price_kopeks,
      option.basePriceKopeks,
    ],
    [option.original_price_label, option.originalPriceLabel],
    currency
  );
  return {
    uuid,
    name: option.name || base.name || uuid || "",
    priceKopeks: priceInfo.kopeks,
    priceLabel: priceInfo.label,
    originalPriceKopeks: originalInfo.kopeks,
    originalPriceLabel: originalInfo.label,
    discountPercent: coercePositiveInt(
      option.discount_percent ?? option.discountPercent,
      null
    ),
    isAvailable: coerceBoolean(
      option.is_available ??
        option.available ??
        option.enabled ??
        option.selectable ??
        true,
      true
    ),
    description: option.description || "",
  };
}

export function normalizeSubscriptionPurchasePayload(
  payload: any,
  userData: any
) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload.data || payload.config || payload;
  const currency = (
    root.currency ||
    payload.currency ||
    userData?.balance_currency ||
    "RUB"
  )
    .toString()
    .toUpperCase();
  const balanceKopeks = coercePositiveInt(
    root.balance_kopeks ??
      root.balanceKopeks ??
      payload.balance_kopeks ??
      payload.balanceKopeks ??
      userData?.balance_kopeks,
    null
  );

  return {
    raw: payload,
    currency,
    balanceKopeks,
    balanceLabel:
      root.balance_label ||
      payload.balance_label ||
      (balanceKopeks !== null
        ? formatPriceFromKopeks(balanceKopeks, currency)
        : ""),
    periods: ensureArray(
      root.periods || root.available_periods || root.options?.periods || []
    ),
    traffic: root.traffic || root.traffic_options || root.trafficOptions || {},
    servers: root.servers || root.countries || {},
    devices: root.devices || root.device_options || root.deviceOptions || {},
    selection: root.selection || root.defaultSelection || root.defaults || {},
    summary: root.summary || payload.summary || null,
    promo: root.promo || root.discounts || null,
    subscriptionId:
      root.subscription_id ||
      root.subscriptionId ||
      payload.subscription_id ||
      payload.subscriptionId ||
      null,
  };
}

export function getSubscriptionPurchaseTrafficConfig(
  period: any,
  subscriptionPurchaseData: any
) {
  const base = subscriptionPurchaseData?.traffic || {};
  const override =
    period &&
    (period.traffic || period.traffic_options || period.trafficOptions);
  const result = { ...base };
  if (override && typeof override === "object") {
    Object.assign(result, override);
    if (override.options || override.available) {
      result.options = ensureArray(override.options || override.available);
    }
  }
  if (!Array.isArray(result.options) && base.options) {
    result.options = ensureArray(base.options);
  }
  return result;
}

export function getSubscriptionPurchaseServersConfig(
  period: any,
  subscriptionPurchaseData: any
) {
  const base =
    subscriptionPurchaseData?.servers ||
    subscriptionPurchaseData?.countries ||
    {};
  const override = period && (period.servers || period.countries);
  const result = { ...base };
  if (override && typeof override === "object") {
    Object.assign(result, override);
    if (override.options || override.available) {
      result.options = ensureArray(override.options || override.available);
    }
  }
  if (!Array.isArray(result.options)) {
    result.options = ensureArray(base.options || base.available || []);
  }
  return result;
}

export function getSubscriptionPurchaseDevicesConfig(
  period: any,
  subscriptionPurchaseData: any
) {
  const base = subscriptionPurchaseData?.devices || {};
  const override =
    period && (period.devices || period.device_options || period.deviceOptions);
  const result = { ...base };
  if (override && typeof override === "object") {
    Object.assign(result, override);
    if (override.options) {
      result.options = ensureArray(override.options);
    }
  }
  if (!Array.isArray(result.options) && base.options) {
    result.options = ensureArray(base.options);
  }
  return result;
}

export function ensurePurchaseTrafficSelection(
  config: any,
  subscriptionPurchaseSelections: any
) {
  const mode = String(config?.mode || "").toLowerCase();
  const selectable =
    config &&
    config.selectable !== false &&
    !["fixed", "fixed_with_topup"].includes(mode);
  const options = ensureArray(config?.options || config?.available || []);
  if (!selectable || !options.length) {
    if (
      config &&
      (config.current !== undefined || config.default !== undefined)
    ) {
      const fixedValue = config.current ?? config.default ?? null;
      if (fixedValue !== undefined) {
        subscriptionPurchaseSelections.trafficValue = fixedValue;
      }
    }
    return;
  }

  const normalizedOptions = options
    .map((option: any) => ({
      raw: option,
      value:
        option?.value ??
        option?.traffic ??
        option?.limit ??
        option?.amount ??
        option?.id ??
        option?.code ??
        null,
    }))
    .filter(
      (option: any) => option.value !== null && option.value !== undefined
    );

  let selectedValue = subscriptionPurchaseSelections.trafficValue;
  if (selectedValue !== null && selectedValue !== undefined) {
    const exists = normalizedOptions.some(
      (option: any) => String(option.value) === String(selectedValue)
    );
    if (!exists) {
      selectedValue = null;
    }
  }

  if (selectedValue === null) {
    const defaultOption = normalizedOptions.find((option: any) =>
      coerceBoolean(option.raw?.is_default ?? option.raw?.isDefault, false)
    );
    const fallback = defaultOption || normalizedOptions[0];
    selectedValue = fallback ? fallback.value : null;
  }

  subscriptionPurchaseSelections.trafficValue = selectedValue;
}

export function filterActivePurchaseServerOptions(options: any[]) {
  if (!Array.isArray(options)) {
    return [];
  }
  return options.filter((option) =>
    coerceBoolean(option?.isAvailable ?? true, true)
  );
}

export function ensurePurchaseServersSelection(
  config: any,
  subscriptionPurchaseSelections: any,
  subscriptionPurchaseData: any,
  userData: any
) {
  const currency = (
    subscriptionPurchaseData?.currency ||
    userData?.balance_currency ||
    "RUB"
  )
    .toString()
    .toUpperCase();
  const options = ensureArray(config?.options || config?.available || []);
  const normalizedOptions = options
    .map((option) => normalizePurchaseServerOption(option, currency))
    .filter(Boolean);
  const activeOptions = filterActivePurchaseServerOptions(normalizedOptions);
  const availableUuids = activeOptions
    .map((option: any) => option.uuid)
    .filter(Boolean);
  let minSelectable =
    coercePositiveInt(
      config?.min ?? config?.min_selectable ?? config?.minRequired,
      0
    ) || 0;
  let maxSelectable =
    coercePositiveInt(
      config?.max ?? config?.max_selectable ?? config?.maxAllowed,
      0
    ) || 0;

  if (!availableUuids.length) {
    minSelectable = 0;
    if (maxSelectable) {
      maxSelectable = 0;
    }
  } else {
    if (minSelectable) {
      minSelectable = Math.min(minSelectable, availableUuids.length);
    }
    if (maxSelectable) {
      maxSelectable = Math.min(maxSelectable, availableUuids.length);
    }
  }
  const selection =
    subscriptionPurchaseSelections.servers instanceof Set
      ? new Set(subscriptionPurchaseSelections.servers)
      : new Set();

  Array.from(selection).forEach((value) => {
    if (!availableUuids.includes(String(value))) {
      selection.delete(value);
    }
  });

  const selectable =
    config?.selectable !== false &&
    availableUuids.length > 1 &&
    (maxSelectable === 0 || maxSelectable > 1 || minSelectable === 0);
  if (!selectable) {
    selection.clear();
    if (availableUuids[0]) {
      selection.add(availableUuids[0]);
    }
    subscriptionPurchaseSelections.servers = selection;
    return;
  }

  if (!selection.size) {
    const defaults = ensureArray(
      config?.selected ||
        config?.default ||
        config?.current ||
        config?.preselected ||
        []
    );
    defaults.map(String).forEach((uuid: string) => {
      if (availableUuids.includes(uuid)) {
        selection.add(uuid);
      }
    });
  }

  if (!selection.size && minSelectable > 0) {
    availableUuids
      .slice(0, minSelectable)
      .forEach((uuid: string) => selection.add(uuid));
  }

  subscriptionPurchaseSelections.servers = selection;
}

export function ensurePurchaseDevicesSelection(
  config: any,
  subscriptionPurchaseSelections: any
) {
  const min = coercePositiveInt(config?.min ?? config?.minimum ?? 0, 0) || 0;
  const max = coercePositiveInt(config?.max ?? config?.maximum ?? 0, 0) || 0;
  const defaults = [
    config?.current,
    config?.default,
    config?.included,
    config?.base,
  ];

  let value = coercePositiveInt(subscriptionPurchaseSelections.devices, null);
  if (value === null) {
    for (const candidate of defaults) {
      const normalized = coercePositiveInt(candidate, null);
      if (normalized !== null) {
        value = normalized;
        break;
      }
    }
  }

  if (value === null) {
    value = min > 0 ? min : 1;
  }

  value = Math.max(min, value);
  if (max && value > max) {
    value = max;
  }

  subscriptionPurchaseSelections.devices = value;
}

export function ensureSubscriptionPurchaseSelectionsValidForPeriod(
  period: any,
  subscriptionPurchaseSelections: any,
  subscriptionPurchaseData: any,
  userData: any
) {
  const trafficConfig = getSubscriptionPurchaseTrafficConfig(
    period,
    subscriptionPurchaseData
  );
  ensurePurchaseTrafficSelection(trafficConfig, subscriptionPurchaseSelections);
  const serversConfig = getSubscriptionPurchaseServersConfig(
    period,
    subscriptionPurchaseData
  );
  ensurePurchaseServersSelection(
    serversConfig,
    subscriptionPurchaseSelections,
    subscriptionPurchaseData,
    userData
  );
  const devicesConfig = getSubscriptionPurchaseDevicesConfig(
    period,
    subscriptionPurchaseData
  );
  ensurePurchaseDevicesSelection(devicesConfig, subscriptionPurchaseSelections);
}

export function buildSubscriptionPurchaseSelectionPayload(
  period: any,
  subscriptionPurchaseSelections: any
) {
  const selection: any = {};
  const periodId = resolvePurchasePeriodId(period);
  if (periodId !== null && periodId !== undefined) {
    const idString = String(periodId);
    selection.period_id = idString;
    selection.periodId = idString;
    selection.period_key = idString;
    selection.periodKey = idString;
    selection.period = idString;
    selection.code = idString;
  }

  const periodDays = resolvePurchasePeriodDays(period);
  if (periodDays !== null) {
    selection.period_days = periodDays;
    selection.periodDays = periodDays;
    selection.duration_days = periodDays;
    selection.durationDays = periodDays;
  }

  const periodMonths = coercePositiveInt(
    period?.months ??
      period?.period ??
      period?.period_months ??
      period?.periodMonths,
    null
  );
  if (periodMonths !== null) {
    selection.months = periodMonths;
    selection.period_months = periodMonths;
    selection.periodMonths = periodMonths;
  }

  const trafficValue = subscriptionPurchaseSelections.trafficValue;
  if (trafficValue !== null && trafficValue !== undefined) {
    selection.traffic_value = trafficValue;
    selection.traffic = trafficValue;
    selection.traffic_gb = trafficValue;
    selection.trafficGb = trafficValue;
    selection.limit = trafficValue;
  }

  const servers = Array.from(
    subscriptionPurchaseSelections.servers instanceof Set
      ? subscriptionPurchaseSelections.servers
      : []
  );
  if (servers.length) {
    selection.servers = servers;
    selection.countries = servers;
    selection.server_uuids = servers;
    selection.serverUuids = servers;
  }

  const devices = coercePositiveInt(
    subscriptionPurchaseSelections.devices,
    null
  );
  if (devices !== null) {
    selection.devices = devices;
    selection.device_limit = devices;
    selection.deviceLimit = devices;
  }

  return selection;
}

export function normalizeSubscriptionPurchasePreview(
  payload: any,
  subscriptionPurchaseData: any,
  userData: any
) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const currency = (
    subscriptionPurchaseData?.currency ||
    userData?.balance_currency ||
    "RUB"
  )
    .toString()
    .toUpperCase();
  const root = payload.preview || payload.data || payload.summary || payload;

  const totalInfo = resolvePurchasePrice(
    [
      root.total_price_kopeks,
      root.totalPriceKopeks,
      root.final_price_kopeks,
      root.finalPriceKopeks,
      root.price_kopeks,
      root.priceKopeks,
      root.amount_kopeks,
      root.amountKopeks,
    ],
    [
      root.total_price_label,
      root.totalPriceLabel,
      root.final_price_label,
      root.finalPriceLabel,
      root.price_label,
      root.priceLabel,
      root.amount_label,
      root.amountLabel,
    ],
    currency
  );

  const originalInfo = resolvePurchasePrice(
    [
      root.original_price_kopeks,
      root.originalPriceKopeks,
      root.base_price_kopeks,
      root.basePriceKopeks,
    ],
    [
      root.original_price_label,
      root.originalPriceLabel,
      root.base_price_label,
      root.basePriceLabel,
    ],
    currency
  );

  const perMonthInfo = resolvePurchasePrice(
    [
      root.per_month_price_kopeks,
      root.perMonthPriceKopeks,
      root.monthly_price_kopeks,
      root.monthlyPriceKopeks,
    ],
    [
      root.per_month_price_label,
      root.perMonthPriceLabel,
      root.monthly_price_label,
      root.monthlyPriceLabel,
    ],
    currency
  );

  const discountPercent = coercePositiveInt(
    root.discount_percent ?? root.discountPercent,
    null
  );
  const discountLabel = root.discount_label || root.discountLabel || null;
  const discountLines = ensureArray(
    root.discount_lines ||
      root.discountLines ||
      root.promo ||
      root.discounts ||
      []
  )
    .map((line: any) => (typeof line === "string" ? line : line?.label))
    .filter(Boolean);

  const breakdown = ensureArray(root.breakdown || root.items || [])
    .map((item: any) => {
      if (!item) {
        return null;
      }
      const label = item.label || item.title || "";
      const value = item.value_label || item.valueLabel || item.value || "";
      if (!label && !value) {
        return null;
      }
      return {
        label,
        value,
        highlight: coerceBoolean(
          item.highlight ?? item.emphasis ?? item.isImportant,
          false
        ),
      };
    })
    .filter(Boolean);

  const balanceKopeks = coercePositiveInt(
    root.balance_kopeks ??
      root.balanceKopeks ??
      payload.balance_kopeks ??
      payload.balanceKopeks ??
      subscriptionPurchaseData?.balanceKopeks ??
      userData?.balance_kopeks,
    null
  );
  const balanceLabel =
    root.balance_label ||
    root.balanceLabel ||
    (balanceKopeks !== null
      ? formatPriceFromKopeks(balanceKopeks, currency)
      : "");

  const missingAmountKopeks = coercePositiveInt(
    root.missing_amount_kopeks ??
      root.missingAmountKopeks ??
      root.balance_needed_kopeks ??
      root.balanceNeededKopeks ??
      root.amount_due_kopeks ??
      root.amountDueKopeks,
    null
  );
  const missingAmountLabel =
    root.missing_amount_label ||
    root.missingAmountLabel ||
    (missingAmountKopeks !== null
      ? formatPriceFromKopeks(missingAmountKopeks, currency)
      : "");

  return {
    raw: payload,
    totalPriceKopeks: totalInfo.kopeks,
    totalPriceLabel: totalInfo.label,
    originalPriceKopeks: originalInfo.kopeks,
    originalPriceLabel: originalInfo.label,
    perMonthLabel: perMonthInfo.label,
    discountPercent,
    discountLabel,
    discountLines,
    breakdown,
    balanceKopeks,
    balanceLabel,
    missingAmountKopeks,
    missingAmountLabel,
    canPurchase: coerceBoolean(
      root.can_purchase ??
        root.canPurchase ??
        (missingAmountKopeks === null || missingAmountKopeks <= 0),
      true
    ),
    statusMessage:
      root.status_message ||
      root.statusMessage ||
      payload.status_message ||
      payload.statusMessage ||
      "",
  };
}

export const DEFAULT_AUTOPAY_DAY_OPTIONS = [1, 3, 7, 14];

export interface AutopayState {
  enabled?: boolean;
  daysBefore: number | null;
  defaultDaysBefore: number | null;
  options: number[];
}

export function normalizeAutopayPayload(raw: any): AutopayState | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const enabledCandidate =
    raw.autopay_enabled ?? raw.enabled ?? raw.is_enabled ?? raw.active ?? null;
  let enabledValue: boolean | undefined;
  if (typeof enabledCandidate === "boolean") {
    enabledValue = enabledCandidate;
  } else if (enabledCandidate != null) {
    enabledValue = coerceBoolean(enabledCandidate, undefined);
  }

  const daysCandidate =
    raw.autopay_days_before ??
    raw.days_before ??
    raw.daysBefore ??
    raw.days ??
    raw.value ??
    null;
  const daysBefore =
    daysCandidate != null ? coercePositiveInt(daysCandidate, null) : null;

  const defaultDaysCandidate =
    raw.default_autopay_days_before ??
    raw.default_autopay_days ??
    raw.default_days_before ??
    raw.default_days ??
    raw.defaultDaysBefore ??
    raw.defaultDays ??
    raw.default ??
    null;
  const defaultDaysBefore =
    defaultDaysCandidate != null
      ? coercePositiveInt(defaultDaysCandidate, null)
      : null;

  const optionSet = new Set<number>();
  const optionSources = [
    raw.autopay_days_options,
    raw.autopayDaysOptions,
    raw.days_options,
    raw.daysOptions,
    raw.available_days,
    raw.availableDays,
  ];

  optionSources.forEach((source) => {
    if (!source) {
      return;
    }
    const normalized = Array.isArray(source)
      ? source
      : typeof source === "object"
      ? Object.values(source)
      : [source];
    normalized.forEach((item: any) => {
      if (item == null) {
        return;
      }
      if (typeof item === "object") {
        const candidate =
          item.days_before ??
          item.daysBefore ??
          item.value ??
          item.days ??
          item.amount ??
          null;
        const numeric =
          candidate != null ? coercePositiveInt(candidate, null) : null;
        if (numeric !== null) {
          optionSet.add(numeric);
        }
        return;
      }
      const numeric = coercePositiveInt(item, null);
      if (numeric !== null) {
        optionSet.add(numeric);
      }
    });
  });

  const options = Array.from(optionSet).sort((a, b) => a - b);
  if (daysBefore !== null && !optionSet.has(daysBefore)) {
    options.push(daysBefore);
    options.sort((a, b) => a - b);
  }
  if (defaultDaysBefore !== null && !optionSet.has(defaultDaysBefore)) {
    options.push(defaultDaysBefore);
    options.sort((a, b) => a - b);
  }

  return {
    enabled: typeof enabledValue === "boolean" ? enabledValue : undefined,
    daysBefore: daysBefore !== null ? daysBefore : null,
    defaultDaysBefore: defaultDaysBefore !== null ? defaultDaysBefore : null,
    options,
  };
}

export function mergeAutopaySources(...sources: any[]): AutopayState | null {
  let hasData = false;
  let enabledValue: boolean | undefined;
  let daysValue: number | null = null;
  let defaultDaysValue: number | null = null;
  const optionSet = new Set<number>();

  DEFAULT_AUTOPAY_DAY_OPTIONS.forEach((value) => {
    const numeric = coercePositiveInt(value, null);
    if (numeric !== null) {
      optionSet.add(numeric);
    }
  });

  sources.forEach((source) => {
    const normalized = normalizeAutopayPayload(source);
    if (!normalized) {
      return;
    }
    hasData = true;
    if (typeof normalized.enabled === "boolean") {
      enabledValue = normalized.enabled;
    }
    if (normalized.daysBefore !== null && normalized.daysBefore !== undefined) {
      daysValue = normalized.daysBefore;
    }
    if (
      normalized.defaultDaysBefore !== null &&
      normalized.defaultDaysBefore !== undefined
    ) {
      defaultDaysValue = normalized.defaultDaysBefore;
    }
    normalized.options.forEach((value) => optionSet.add(value));
  });

  if (!hasData) {
    return null;
  }

  if (daysValue !== null && daysValue !== undefined) {
    optionSet.add(daysValue);
  }
  if (defaultDaysValue !== null && defaultDaysValue !== undefined) {
    optionSet.add(defaultDaysValue);
  }

  const options = Array.from(optionSet).sort((a, b) => a - b);
  let resolvedDays = daysValue;
  if (resolvedDays === null || resolvedDays === undefined) {
    if (defaultDaysValue !== null && defaultDaysValue !== undefined) {
      resolvedDays = defaultDaysValue;
    } else if (options.length) {
      resolvedDays = options[0];
    }
  }

  return {
    enabled: enabledValue,
    daysBefore: resolvedDays,
    defaultDaysBefore:
      defaultDaysValue !== null && defaultDaysValue !== undefined
        ? defaultDaysValue
        : daysValue !== null && daysValue !== undefined
        ? daysValue
        : null,
    options,
  };
}

export function normalizeUserData(payload: any): any {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const userData = { ...payload };
  userData.subscriptionUrl = userData.subscription_url || null;
  userData.subscriptionCryptoLink = userData.subscription_crypto_link || null;
  userData.referral = userData.referral || {
    link:
      payload.referral_link ||
      payload.referralUrl ||
      payload.referral_url ||
      null,
  };
  if (userData.referral) {
    const referralSource = payload.referral || {};
    userData.referral.referral_link =
      userData.referral.referral_link ||
      userData.referral.link ||
      userData.referral.url ||
      userData.referral.href ||
      referralSource.referral_link ||
      referralSource.link ||
      payload.referral_link ||
      payload.referralUrl ||
      payload.referral_url ||
      null;
    userData.referral.link = userData.referral.referral_link;

    userData.referral.referral_code =
      userData.referral.referral_code ||
      referralSource.referral_code ||
      payload.referral_code ||
      null;

    userData.referral.percent =
      userData.referral.percent ||
      userData.referral.bonus_percent ||
      referralSource.bonus_percent ||
      referralSource.percent ||
      payload.referral_percent ||
      payload.referralPercent ||
      referralSource.reward_percent ||
      referralSource.rewardPercent ||
      null;

    userData.referral.friend_bonus_percent =
      userData.referral.friend_bonus_percent ||
      referralSource.friend_bonus_percent ||
      referralSource.friendPercent ||
      referralSource.friend_reward_percent ||
      null;
  }

  const happData = payload?.happ;
  if (happData && typeof happData === "object") {
    userData.happ = { ...happData };

    const happCryptoLinkCandidate =
      happData.cryptoLink ?? happData.crypto_link ?? null;
    if (happCryptoLinkCandidate) {
      if (!userData.happ_crypto_link) {
        userData.happ_crypto_link = happCryptoLinkCandidate;
      }
      if (!userData.happCryptoLink) {
        userData.happCryptoLink = happCryptoLinkCandidate;
      }
    }

    const happRedirectCandidate =
      happData.cryptolinkRedirectLink ??
      happData.cryptolink_redirect_link ??
      happData.redirectLink ??
      happData.redirect_link ??
      null;
    if (happRedirectCandidate) {
      if (!userData.happ_cryptolink_redirect_link) {
        userData.happ_cryptolink_redirect_link = happRedirectCandidate;
      }
      if (!userData.happCryptolinkRedirectLink) {
        userData.happCryptolinkRedirectLink = happRedirectCandidate;
      }
    }

    const happLinkCandidate =
      happData.link ?? happData.appLink ?? happData.url ?? null;
    if (happLinkCandidate) {
      if (!userData.happ_link) {
        userData.happ_link = happLinkCandidate;
      }
      if (!userData.happLink) {
        userData.happLink = happLinkCandidate;
      }
    }
  }

  const normalizedPurchaseUrl = normalizeUrl(
    userData.subscription_purchase_url || userData.subscriptionPurchaseUrl
  );
  userData.subscriptionPurchaseUrl = normalizedPurchaseUrl || null;

  const subscriptionMissingValue = Boolean(
    userData.subscription_missing ?? userData.subscriptionMissing
  );
  userData.subscription_missing = subscriptionMissingValue;
  userData.subscriptionMissing = subscriptionMissingValue;

  const trialAvailableValue = Boolean(
    userData.trial_available ?? userData.trialAvailable
  );
  userData.trial_available = trialAvailableValue;
  userData.trialAvailable = trialAvailableValue;

  const trialDuration = coercePositiveInt(
    userData.trial_duration_days ?? userData.trialDurationDays ?? null,
    null
  );
  userData.trial_duration_days = trialDuration;
  userData.trialDurationDays = trialDuration;

  const missingReason =
    userData.subscription_missing_reason ??
    userData.subscriptionMissingReason ??
    null;
  userData.subscription_missing_reason = missingReason;
  userData.subscriptionMissingReason = missingReason;

  return userData;
}
