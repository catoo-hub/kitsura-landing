import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  CreditCard,
  Settings,
  Zap,
  Wallet,
  User,
  Users,
  FileText,
  HelpCircle,
  Newspaper,
  ChevronRight,
  Copy,
  LogOut,
  History,
  Plus,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Gift,
  Sliders,
  Infinity as InfinityIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { miniappApi } from "@/lib/miniapp-api";
import { API_BASE } from "@/lib/utils";
import type {
  UserData,
  PaymentMethod,
  PurchaseOptions,
  PurchasePeriod,
  ReferralUser,
} from "@/lib/types";
import { InstallationModal } from "./InstallationModal";
import { useUser } from "@/hooks/useUser";
import { useSubscriptionPurchase } from "@/hooks/useSubscriptionPurchase";
import { useSubscriptionSettings } from "@/hooks/useSubscriptionSettings";
import { useSubscriptionAutopay } from "@/hooks/useSubscriptionAutopay";

import LightRays from "@/components/LightRays";

// --- Types ---
interface TabProps {
  userData: UserData | null;
  isLoading: boolean;
  error?: any;
  initData?: string;
  onRefresh: () => void;
  onOpenInstructions?: () => void;
  onNavigate?: (tab: string) => void;
  onOpenSettings?: () => void;
}

interface FinanceTabProps extends TabProps {
  onTopUp: () => void;
}

const negativeTransactionTypes = new Set([
  "withdrawal",
  "subscription_payment",
]);

const formatCurrencyLabel = (value: number, currency: string) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency || "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const formatDateTimeLabel = (value: any) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const buildReferralLink = (referral: any) => {
  if (!referral) return "";
  const rawLink =
    referral.link || referral.referral_link || referral.url || referral.href;
  const code = referral.referral_code || referral.code;
  if (rawLink) return rawLink;
  if (code) return `https://t.me/kitsura_bot?start=${code}`;
  return "";
};

const formatMoneyLabel = (label: any, kopeks: any, currency: string) => {
  if (typeof label === "string" && label.trim()) return label;
  const numeric =
    typeof kopeks === "number" ? kopeks : Number.parseInt(kopeks ?? "", 10);
  if (Number.isFinite(numeric)) {
    return formatCurrencyLabel(numeric / 100, currency);
  }
  return "0";
};

const SubscriptionSettingsDialog = ({
  isOpen,
  onClose,
  userData,
  initData,
  onRefresh,
}: {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData | null;
  initData: string;
  onRefresh: () => void;
}) => {
  const {
    data: purchaseOptions,
    loading: loadingOptions,
    error,
    selections,
    preview,
    previewLoading: calculatingPreview,
    submitting: purchasing,
    ensureData,
    selectPeriod,
    selectTraffic,
    toggleServer,
    submitPurchase,
  } = useSubscriptionPurchase(userData, initData, { forceMode: "purchase" });

  const [removingDevice, setRemovingDevice] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userData && initData) {
      ensureData();
    }
  }, [isOpen, userData, initData, ensureData]);

  const handlePurchase = async () => {
    if (!initData) return;
    try {
      await submitPurchase(selections.periodId);
      setSuccessMsg("Настройки обновлены!");
      onRefresh();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Ошибка при обновлении");
    }
  };

  const handleRemoveDevice = async (hwid?: string) => {
    if (!hwid || !initData) return;
    setRemovingDevice(hwid);
    try {
      await miniappApi.removeDevice(initData, hwid);
      toast.success("Устройство удалено");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Не удалось удалить устройство");
    } finally {
      setRemovingDevice(null);
    }
  };

  const devices = Array.isArray((userData as any)?.connected_devices)
    ? (userData as any).connected_devices
    : Array.isArray((userData as any)?.devices)
    ? (userData as any).devices
    : [];

  const getPeriodLabel = (plan: any) => {
    if (plan.title) return plan.title;
    if (plan.name) return plan.name;
    if (plan.label) return plan.label;
    if (plan.months) return `${plan.months} мес.`;
    if (plan.days) return `${plan.days} дн.`;
    return "Тариф";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Настройка подписки</DialogTitle>
          <DialogDescription>
            Измените параметры или управляйте устройствами
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Devices Section */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">
              Устройства ({devices.length})
            </h4>
            {devices.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Нет подключённых устройств
              </p>
            )}
            {devices.map((device: any, idx: number) => {
              const deviceId =
                device?.hwid || device?.device_id || device?.id || device?.uuid;
              const title =
                [device?.platform, device?.device_model]
                  .filter(Boolean)
                  .join(" • ") ||
                device?.label ||
                deviceId ||
                `Устройство ${idx + 1}`;

              return (
                <div
                  key={deviceId || idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/40 gap-3"
                >
                  <span className="text-sm font-medium truncate flex-1">
                    {title}
                  </span>
                  {deviceId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveDevice(deviceId)}
                      disabled={removingDevice === deviceId}
                    >
                      {removingDevice === deviceId ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <X className="size-4" />
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">
              Удалите устройство в этом меню, чтобы освободить слот.
            </p>
          </div>

          <Separator />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Components ---

const BottomNav = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (t: string) => void;
}) => {
  const navItems = [
    { id: "home", icon: Home, label: "Главная" },
    { id: "subscription", icon: Zap, label: "Подписка" },
    { id: "finance", icon: Wallet, label: "Финансы" },
    { id: "settings", icon: Settings, label: "Настройки" },
  ];

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border/50 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors duration-200 ${
              activeTab === item.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon
              className={`size-6 ${
                activeTab === item.id ? "fill-current/20" : ""
              }`}
            />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const HomeTab = ({
  userData,
  isLoading,
  error,
  onRefresh,
  onOpenInstructions,
  onNavigate,
  onOpenSettings,
}: TabProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Загрузка данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 p-4 text-center">
        <div className="p-3 bg-red-100 text-red-600 rounded-full">
          <AlertCircle className="size-8" />
        </div>
        <h3 className="font-semibold">Ошибка загрузки</h3>
        <p className="text-sm text-muted-foreground">
          {error.message || "Не удалось загрузить данные пользователя"}
        </p>
        <Button onClick={onRefresh} variant="outline">
          Попробовать снова
        </Button>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const hasActiveSubscription =
    !userData.subscription_missing &&
    (userData.user.subscription_actual_status === "active" ||
      userData.user.subscription_status === "active");

  const subscriptionStatus = hasActiveSubscription ? "Активна" : "Не активна";
  const statusColor = hasActiveSubscription ? "text-green-500" : "text-red-500";
  const statusBg = hasActiveSubscription
    ? "bg-green-500/10 border-green-500/20"
    : "bg-red-500/10 border-red-500/20";

  const expiresAt =
    userData.user.subscription_expires_at || userData.user.expires_at;
  const trafficUsed = userData.user.traffic_used || userData.user.used_traffic;
  const trafficLimit =
    userData.user.traffic_limit || userData.user.limit_traffic;

  const formatTraffic = (bytes: number) => {
    if (!bytes) return "0 ГБ";
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} ГБ`;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Привет, {userData.user.first_name || "Пользователь"} 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Твой интернет под защитой
          </p>
        </div>
        <Avatar className="size-10 border border-border">
          <AvatarImage src="/favicon.png" />
          {/* <AvatarFallback>
            {userData.user.first_name?.[0] || "U"}
          </AvatarFallback> */}
        </Avatar>
      </div>

      {/* Status Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-background overflow-hidden relative bg-pattern-grid">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Zap className="size-24" />
        </div>
        <CardHeader className="pb-2">
          <CardDescription>Текущий статус</CardDescription>
          <CardTitle className="text-xl flex items-center gap-2">
            <span className={statusColor}>{subscriptionStatus}</span>
            {hasActiveSubscription && (
              <Badge variant="outline" className={`${statusBg} ${statusColor}`}>
                Premium
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasActiveSubscription ? (
            <div className="space-y-3 mb-4">
              <p className="text-sm text-muted-foreground">
                Подписка активна. Наслаждайтесь безопасным интернетом.
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-background/50 rounded-lg border border-border/50">
                  <span className="text-muted-foreground text-xs block">
                    Истекает
                  </span>
                  <span className="font-medium">
                    {formatDateTimeLabel(expiresAt)}
                  </span>
                </div>
                <div className="p-2 bg-background/50 rounded-lg border border-border/50">
                  <span className="text-muted-foreground text-xs block">
                    Трафик
                  </span>
                  <span className="font-medium">
                    {formatTraffic(trafficUsed)} /{" "}
                    {trafficLimit ? formatTraffic(trafficLimit) : "∞"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">
              Подписка не найдена. Подключите VPN для защиты.
            </p>
          )}

          <Button
            className="w-full shadow-lg shadow-primary/20"
            size="lg"
            onClick={() => {
              if (hasActiveSubscription) {
                onOpenSettings?.();
              } else {
                onNavigate?.("subscription");
              }
            }}
          >
            {hasActiveSubscription ? "Настроить подписку" : "Купить подписку"}
          </Button>

          {userData.trial_available && !hasActiveSubscription && (
            <Button
              variant="outline"
              className="w-full mt-3 border-primary/50 text-primary hover:bg-primary/10"
              onClick={() => onNavigate?.("subscription")}
            >
              Попробовать бесплатно ({userData.trial_duration_days || 3} дня)
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card
          className="bg-card/50 hover:bg-card/80 transition-colors cursor-pointer border-border/50"
          onClick={onOpenInstructions}
        >
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
              <HelpCircle className="size-6" />
            </div>
            <span className="font-medium text-sm">Инструкция</span>
          </CardContent>
        </Card>
        <Card
          className="bg-card/50 hover:bg-card/80 transition-colors cursor-pointer border-border/50"
          onClick={() => window.open("https://t.me/torroixq", "_blank")}
        >
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="p-2 rounded-full bg-purple-500/10 text-purple-500">
              <Users className="size-6" />
            </div>
            <span className="font-medium text-sm">Поддержка</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SubscriptionTab = ({
  userData,
  isLoading,
  initData = "",
  onRefresh,
}: TabProps) => {
  // Constructor state
  const [isConstructorMode, setIsConstructorMode] = useState(false);

  const {
    data: purchaseOptions,
    loading: loadingOptions,
    error,
    selections,
    preview,
    previewLoading: calculatingPreview,
    submitting: purchasing,
    ensureData,
    selectPeriod,
    selectTraffic,
    toggleServer,
    setDevices,
    submitPurchase,
    getSelectedPeriod,
  } = useSubscriptionPurchase(userData, initData, {
    forceMode: isConstructorMode ? "purchase" : undefined,
  });

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (userData && initData) {
      ensureData();
    }
  }, [userData, initData, ensureData, isConstructorMode]);

  const handlePurchase = async (
    periodId?: string | number,
    isCustom: boolean = false
  ) => {
    if (!initData) return;

    try {
      await submitPurchase(periodId);
      setSuccessMsg("Подписка успешно оформлена!");
      onRefresh();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ошибка при оформлении подписки");
    }
  };

  const handlePromoActivate = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoMessage(null);
    try {
      if (!initData) return;

      const result = await miniappApi.activatePromoCode(initData, promoCode);
      setPromoMessage({
        type: "success",
        text: result.message || "Промокод активирован!",
      });
      setPromoCode("");
      onRefresh();
    } catch (err: any) {
      setPromoMessage({
        type: "error",
        text: err.message || "Неверный промокод",
      });
    } finally {
      setPromoLoading(false);
    }
  };

  const { autopayState, updateAutopaySettings, ingestAutopayData } =
    useSubscriptionAutopay();

  useEffect(() => {
    if (userData) {
      ingestAutopayData(userData, userData.autopay, userData.autopay_settings);
    }
  }, [userData, ingestAutopayData]);

  const handleAutoPayToggle = async (enabled: boolean) => {
    // Try to find subscription ID in various places
    const subId =
      userData?.subscription?.id ||
      userData?.subscriptionId ||
      userData?.subscription_id ||
      userData?.user?.id ||
      userData?.id;

    if (!initData || !subId) {
      console.error("Missing initData or subscription ID for autopay toggle");
      // If we can't find ID, we might still try if the API infers it from initData
      // But usually we need an ID.
      // Let's try to proceed if we have initData, maybe the backend handles it.
      if (!initData) return;
    }

    await updateAutopaySettings(initData, subId || "current", { enabled });
    onRefresh();
  };

  const getPeriodLabel = (plan: PurchasePeriod) => {
    if (plan.title) return plan.title;
    if (plan.name) return plan.name;
    if (plan.label) return plan.label;
    if (plan.months) return `${plan.months} мес.`;
    if (plan.days) return `${plan.days} дн.`;
    return "Тариф";
  };

  const getDurationLabel = (plan: PurchasePeriod) => {
    if (plan.months) return `${plan.months} мес.`;
    if (plan.days) return `${plan.days} дн.`;
    return null;
  };

  if (isLoading || !userData) return null;

  const isActive =
    !userData.subscription_missing &&
    (userData.user.subscription_actual_status === "active" ||
      userData.user.subscription_status === "active");

  return (
    <div className="space-y-6 pb-24">
      <h2 className="text-2xl font-bold">Управление подпиской</h2>

      <Card>
        <CardHeader>
          <CardTitle>Мой тариф</CardTitle>
          <CardDescription>Информация о текущем плане</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Статус</span>
            <Badge
              variant="secondary"
              className={
                isActive
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              }
            >
              {isActive ? "Активна" : "Не активна"}
            </Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Устройства</span>
            <div className="flex items-center gap-1 font-medium text-primary">
              <InfinityIcon className="size-4" />
              <span>Безлимитно</span>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Автопродление</span>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  autopayState.enabled ?? userData.autopay
                    ? "text-green-500"
                    : "text-muted-foreground"
                }`}
              >
                {autopayState.enabled ?? userData.autopay
                  ? "Включено"
                  : "Выключено"}
              </span>
              <Switch
                checked={autopayState.enabled ?? userData.autopay ?? false}
                onCheckedChange={handleAutoPayToggle}
                disabled={autopayState.saving || autopayState.loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promo Code Section */}
      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="size-5 text-primary" />
            <span className="font-semibold">Промокод</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Введите код"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="bg-background"
            />
            <Button
              onClick={handlePromoActivate}
              disabled={promoLoading || !promoCode}
            >
              {promoLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "OK"
              )}
            </Button>
          </div>
          {promoMessage && (
            <p
              className={`text-xs mt-2 ${
                promoMessage.type === "success"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {promoMessage.text}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Продление</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 gap-1 text-muted-foreground hover:text-primary"
            onClick={() => setIsConstructorMode(!isConstructorMode)}
          >
            <Sliders className="size-3" />
            {isConstructorMode ? "Готовые тарифы" : "Настроить вручную"}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="size-4" />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-green-100 text-green-600 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            {successMsg}
          </div>
        )}

        {loadingOptions ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {!isConstructorMode ? (
              // Standard Tariffs View
              <div className="grid grid-cols-1 gap-3">
                <p className="text-xs text-muted-foreground/70 px-1">
                  Стоимость рассчитана с учетом ваших текущих настроек подписки.
                </p>
                {purchaseOptions?.periods.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-4 rounded-xl border ${
                      plan.is_best
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    } flex justify-between items-center cursor-pointer hover:border-primary/50 transition-colors`}
                  >
                    {plan.is_best && (
                      <span className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
                        Выгодно
                      </span>
                    )}
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">
                        {getPeriodLabel(plan)}
                      </span>
                      {getDurationLabel(plan) &&
                        getDurationLabel(plan) !== getPeriodLabel(plan) && (
                          <span className="text-sm text-muted-foreground">
                            {getDurationLabel(plan)}
                          </span>
                        )}
                      {(plan.discount_percent || plan.discountPercent) && (
                        <span className="text-xs text-green-500 font-medium">
                          -{plan.discount_percent || plan.discountPercent}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {(() => {
                          const price =
                            plan.final_price_kopeks ??
                            plan.finalPriceKopeks ??
                            plan.price_kopeks ??
                            plan.priceKopeks ??
                            0;
                          return (price / 100).toFixed(0);
                        })()}{" "}
                        {purchaseOptions.currency}
                      </span>
                      <Button
                        size="sm"
                        variant={plan.is_best ? "default" : "secondary"}
                        onClick={() => handlePurchase(plan.id)}
                        disabled={purchasing}
                      >
                        {purchasing ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Выбрать"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                {purchaseOptions?.periods.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Нет доступных тарифов
                  </div>
                )}
              </div>
            ) : (
              // Constructor View
              <Card className="border-dashed">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Период подписки</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {purchaseOptions?.periods.map((plan: any) => {
                        const pid = plan.id?.toString();
                        return (
                          <div
                            key={pid}
                            onClick={() => selectPeriod(pid)}
                            className={`
                            cursor-pointer rounded-lg p-2 text-center border transition-all
                            ${
                              selections.periodId === pid
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border hover:border-primary/50"
                            }
                          `}
                          >
                            <div className="text-sm">
                              {getPeriodLabel(plan)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Traffic selection */}
                  {(() => {
                    const trafficOptions =
                      purchaseOptions?.traffic?.options ||
                      purchaseOptions?.traffic?.available ||
                      [];
                    return trafficOptions.length ? (
                      <div className="space-y-2">
                        <Label>Трафик</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {trafficOptions.map((traffic: any, idx: number) => {
                            const value =
                              traffic.value ??
                              traffic.traffic ??
                              traffic.limit ??
                              traffic.amount ??
                              traffic.id ??
                              idx;
                            const selected =
                              selections.trafficValue !== null
                                ? selections.trafficValue === value
                                : false;
                            return (
                              <div
                                key={value}
                                onClick={() => selectTraffic(value)}
                                className={`
                                cursor-pointer rounded-lg p-2 text-center border transition-all
                                ${
                                  selected
                                    ? "border-primary bg-primary/10 text-primary font-medium"
                                    : "border-border hover:border-primary/50"
                                }
                              `}
                              >
                                <div className="text-sm">
                                  {traffic.label ||
                                    (value === 0 ? "∞ ГБ" : `${value} ГБ`)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Server selection */}
                  {(() => {
                    const serversOptions =
                      purchaseOptions?.servers?.available ||
                      purchaseOptions?.servers?.options ||
                      [];
                    return serversOptions.length ? (
                      <div className="space-y-2">
                        <Label>
                          Локации (
                          {selections.servers.size > 0
                            ? selections.servers.size
                            : "Все"}
                          )
                        </Label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                          {serversOptions.map((server: any, idx: number) => {
                            const uuid =
                              server.uuid || server.id || server.code || idx;
                            const isSelected = selections.servers.has(uuid);
                            return (
                              <div
                                key={uuid}
                                onClick={() => toggleServer(uuid)}
                                className={`
                                cursor-pointer rounded-lg p-2 border transition-all flex items-center gap-2
                                ${
                                  isSelected
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border hover:border-primary/50"
                                }
                              `}
                              >
                                <div
                                  className={`size-4 rounded-full border flex items-center justify-center ${
                                    isSelected
                                      ? "border-primary bg-primary"
                                      : "border-muted-foreground"
                                  }`}
                                >
                                  {isSelected && (
                                    <CheckCircle2 className="size-3 text-primary-foreground" />
                                  )}
                                </div>
                                <span className="text-sm truncate">
                                  {server.name ||
                                    server.label ||
                                    server.country ||
                                    uuid}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Выберите нужные локации. Если ничего не выбрано, будут
                          доступны все.
                        </p>
                      </div>
                    ) : null;
                  })()}

                  <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Итоговая стоимость
                      </span>
                      <span className="text-xs text-muted-foreground/70">
                        Сумма формируется с учетом настроек подписки
                      </span>
                      <span className="text-xl font-bold">
                        {calculatingPreview ? (
                          <Loader2 className="size-4 animate-spin inline" />
                        ) : (
                          (() => {
                            // 1. Prefer Server-side Preview (Source of Truth)
                            if (
                              preview?.total?.kopeks !== undefined &&
                              preview?.total?.kopeks !== null
                            ) {
                              return (
                                (preview.total.kopeks / 100).toFixed(0) +
                                " " +
                                (preview.currency || purchaseOptions?.currency)
                              );
                            }

                            // 2. Fallback Client-side Calculation (Additive)
                            const period = purchaseOptions?.periods.find(
                              (p: any) =>
                                p.id?.toString() === selections.periodId
                            );

                            let totalKopeks =
                              period?.final_price_kopeks ??
                              period?.price_kopeks ??
                              period?.priceKopeks ??
                              0;

                            // Determine Duration in Months for multipliers
                            let months =
                              period?.months ??
                              period?.period_months ??
                              period?.periodMonths;
                            if (!months && period?.days) {
                              months = Math.ceil(period.days / 30);
                            }
                            if (!months) months = 1;

                            // Add Traffic Price
                            const trafficOptions =
                              purchaseOptions?.traffic?.options ||
                              purchaseOptions?.traffic?.available ||
                              [];
                            const trafficOpt = trafficOptions.find((t: any) => {
                              const val = t.value ?? t.traffic ?? t.limit;
                              return val === selections.trafficValue;
                            });

                            if (trafficOpt) {
                              const trafficPrice =
                                trafficOpt.price_kopeks ??
                                trafficOpt.priceKopeks ??
                                0;
                              totalKopeks += trafficPrice * months;
                            }

                            // Add Server Prices
                            const serverOptions =
                              purchaseOptions?.servers?.available ||
                              purchaseOptions?.servers?.options ||
                              [];
                            if (selections.servers.size > 0) {
                              selections.servers.forEach((uuid: string) => {
                                const sOpt = serverOptions.find(
                                  (s: any) =>
                                    (s.uuid || s.id || s.code) === uuid
                                );
                                if (sOpt) {
                                  const serverPrice =
                                    sOpt.price_kopeks ?? sOpt.priceKopeks ?? 0;
                                  totalKopeks += serverPrice * months;
                                }
                              });
                            }

                            return (
                              "~" +
                              (totalKopeks / 100).toFixed(0) +
                              " " +
                              (purchaseOptions?.currency || "₽")
                            );
                          })()
                        )}
                      </span>
                    </div>
                    <Button
                      onClick={() =>
                        selections.periodId &&
                        handlePurchase(selections.periodId, true)
                      }
                      disabled={
                        purchasing || !selections.periodId || calculatingPreview
                      }
                    >
                      {purchasing ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Оплатить"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const FinanceTab = ({ userData, isLoading, onTopUp }: FinanceTabProps) => {
  if (isLoading || !userData) return null;

  const balance =
    userData.balance_kopeks !== undefined
      ? userData.balance_kopeks / 100
      : userData.user?.balance !== undefined
      ? userData.user.balance
      : userData.balance !== undefined
      ? userData.balance
      : 0;

  const currency = (
    userData.user?.balance_currency ||
    userData.balance_currency ||
    "RUB"
  ).toUpperCase();

  const transactions = Array.isArray(userData.transactions)
    ? userData.transactions
    : Array.isArray((userData as any).history)
    ? (userData as any).history
    : Array.isArray((userData as any).payments)
    ? (userData as any).payments
    : [];

  return (
    <div className="space-y-6 pb-24">
      <h2 className="text-2xl font-bold">Финансы</h2>

      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-none">
        <CardContent className="p-6">
          <div className="flex flex-col gap-1">
            <span className="text-gray-400 text-sm">Ваш баланс</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{balance}</span>
              <span className="text-xl text-gray-400">{currency}</span>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              className="flex-1 bg-white text-black hover:bg-gray-200 border-none"
              onClick={onTopUp}
            >
              <Plus className="mr-2 size-4" />
              Пополнить
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">История операций</h3>
          <Button variant="ghost" size="sm" className="text-xs h-8">
            Все
          </Button>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              История операций пуста
            </div>
          )}
          {transactions.map((tx: any, idx: number) => {
            const typeRaw = (tx.type || tx.kind || tx.title || "")
              .toString()
              .toLowerCase();
            const typeLabelMap: Record<string, string> = {
              topup: "Пополнение",
              deposit: "Пополнение",
              withdrawal: "Вывод",
              subscription_payment: "Списание за подписку",
              renewal: "Продление",
              referral_bonus: "Реферальный бонус",
            };
            const normalizedType = typeRaw.replace(/\s+/g, "_");
            const typeLabel =
              typeLabelMap[normalizedType] ||
              tx.title ||
              tx.type ||
              tx.kind ||
              (normalizedType ? normalizedType.replace(/_/g, " ") : "Операция");

            const amountRaw =
              typeof tx.amount_kopeks === "number"
                ? tx.amount_kopeks
                : Number.parseInt(
                    (tx.amount_kopeks ??
                      tx.amount ??
                      tx.value ??
                      tx.sum ??
                      0) as any,
                    10
                  );
            const amountValue = Number.isFinite(amountRaw)
              ? amountRaw / 100
              : 0;
            const isNegative =
              amountValue < 0 || negativeTransactionTypes.has(normalizedType);
            const amountLabel = `${isNegative ? "-" : "+"}${formatCurrencyLabel(
              Math.abs(amountValue),
              currency
            )}`;

            const date = tx.created_at || tx.date || tx.createdAt;
            const statusLabel =
              tx.is_completed === false ? "В обработке" : "Завершено";
            const metaParts = [formatDateTimeLabel(date), statusLabel].filter(
              Boolean
            );
            const description =
              tx.description || tx.message || tx.comment || tx.details;

            return (
              <div
                key={tx.id || idx}
                className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/40 gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{typeLabel}</div>
                  {metaParts.length > 0 && (
                    <div className="text-xs text-muted-foreground truncate">
                      {metaParts.join(" • ")}
                    </div>
                  )}
                  {description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {description}
                    </div>
                  )}
                </div>
                <div
                  className={`font-semibold text-right shrink-0 ${
                    isNegative ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {amountLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SettingsTab = ({
  userData,
  isLoading,
  initData,
  onRefresh,
  appConfig,
}: TabProps & { appConfig?: any }) => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [referrals, setReferrals] = useState<ReferralUser[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);

  useEffect(() => {
    if (isReferralOpen && initData) {
      setIsLoadingReferrals(true);
      miniappApi
        .fetchReferrals(initData)
        .then(setReferrals)
        .catch((err) => console.error("Failed to fetch referrals", err))
        .finally(() => setIsLoadingReferrals(false));
    }
  }, [isReferralOpen, initData]);

  if (isLoading || !userData) return null;

  const currency = (
    userData.user?.balance_currency ||
    userData.balance_currency ||
    "RUB"
  ).toUpperCase();

  const referral = userData.referral as any;
  const referralLink = buildReferralLink(referral);
  const referralCode = referral?.referral_code || referral?.code;
  const referralCopyValue = referralLink || referralCode || "";
  const referralStats = referral?.stats || referral?.statistics || {};
  const invitedCount =
    referralStats.invited_count ?? referralStats.invited ?? 0;
  const activeCount =
    referralStats.active_referrals_count ??
    referralStats.active_count ??
    referralStats.active ??
    0;
  const paidCount =
    referralStats.paid_referrals_count ??
    referralStats.paid_count ??
    referralStats.paid ??
    referralStats.payings ??
    0;
  const totalEarnedLabel = formatMoneyLabel(
    referralStats.total_earned_label ?? referralStats.earned_total_label,
    referralStats.total_earned_kopeks ??
      referralStats.earned_total_kopeks ??
      referralStats.earned_total,
    currency
  );
  const monthEarnedLabel = formatMoneyLabel(
    referralStats.month_earned_label ?? referralStats.earned_month_label,
    referralStats.month_earned_kopeks ??
      referralStats.earned_month_kopeks ??
      referralStats.earned_month,
    currency
  );
  const conversionRate = Number.isFinite(referralStats.conversion_rate)
    ? referralStats.conversion_rate
    : invitedCount
    ? (paidCount / invitedCount) * 100
    : 0;
  const friendBonus =
    referral?.friend_bonus_percent ?? referral?.friendPercent ?? null;
  const inviterBonus =
    referral?.percent ??
    referral?.bonus_percent ??
    referral?.reward_percent ??
    null;
  const referralTerms = referral?.terms || {};

  const handleCopy = (value?: string) => {
    if (!value) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(() => {
        toast.success("Скопировано");
      });
    }
  };

  const menuItems = [
    {
      icon: Users,
      label: "Реферальная система",
      badge: userData?.referral?.stats?.earned_total
        ? `${userData.referral.stats.earned_total} ₽`
        : "New",
      onClick: () => setIsReferralOpen(true),
    },
    {
      icon: FileText,
      label: "Правила сервиса",
      onClick: () => setIsTermsOpen(true),
    },
    {
      icon: Newspaper,
      label: "Новости",
      external: true,
      onClick: () => window.open("https://t.me/kitsuravpn", "_blank"),
    },
    {
      icon: HelpCircle,
      label: "Поддержка",
      onClick: () => window.open("https://t.me/torroixq", "_blank"),
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      <h2 className="text-2xl font-bold">Настройки</h2>

      <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
        <Avatar className="size-14">
          <AvatarImage src="" />
          <AvatarFallback>
            {userData.user.first_name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {userData.user.first_name} {userData.user.last_name}
          </h3>
          <p className="text-sm text-muted-foreground">
            ID: {userData.user.telegram_id || userData.user.id || "Неизвестно"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            onClick={item.onClick}
            className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50 hover:bg-card transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <item.icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <Badge variant="secondary" className="text-xs h-5">
                  {item.badge}
                </Badge>
              )}
              <ChevronRight className="size-4 text-muted-foreground/50" />
            </div>
          </div>
        ))}
      </div>

      {referral && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-primary/20">
          <CardContent className="p-4 space-y-2">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-sm">
                Ваша реферальная ссылка
              </span>
              <div className="flex gap-2">
                <code className="flex-1 bg-background/50 rounded-lg px-3 py-2 text-xs font-mono flex items-center text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                  {referralLink || referralCopyValue || "Ссылка недоступна"}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => handleCopy(referralCopyValue)}
                  disabled={!referralCopyValue}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>Приглашено: {invitedCount}</span>
              <span>Активны: {activeCount}</span>
              <span>Заработано: {totalEarnedLabel}</span>
            </div>
            {(inviterBonus || friendBonus) && (
              <p className="text-xs text-muted-foreground">
                Бонус: {inviterBonus || friendBonus}% с пополнений друзей.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Приглашайте друзей и получайте бонусы.
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isReferralOpen} onOpenChange={setIsReferralOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-md overflow-y-auto custom-scrollbar flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Реферальная программа</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-2">
              <h4 className="font-medium">Ваша ссылка</h4>
              <div className="flex gap-2">
                <code className="flex-1 bg-background rounded-lg px-3 py-2 text-xs font-mono flex items-center text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap border border-border">
                  {referralLink || referralCopyValue || "Ссылка недоступна"}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => handleCopy(referralCopyValue)}
                  disabled={!referralCopyValue}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-card rounded-xl border border-border text-center">
                <div className="text-2xl font-bold">{invitedCount}</div>
                <div className="text-xs text-muted-foreground">Приглашено</div>
              </div>
              <div className="p-3 bg-card rounded-xl border border-border text-center">
                <div className="text-2xl font-bold">{activeCount}</div>
                <div className="text-xs text-muted-foreground">Активны</div>
              </div>
              <div className="p-3 bg-card rounded-xl border border-border text-center">
                <div className="text-2xl font-bold">{paidCount}</div>
                <div className="text-xs text-muted-foreground">Оплатили</div>
              </div>
              <div className="p-3 bg-card rounded-xl border border-border text-center">
                <div className="text-xl font-bold">{totalEarnedLabel}</div>
                <div className="text-xs text-muted-foreground">Всего</div>
              </div>
              <div className="p-3 bg-card rounded-xl border border-border text-center">
                <div className="text-xl font-bold">{monthEarnedLabel}</div>
                <div className="text-xs text-muted-foreground">За месяц</div>
              </div>
              <div className="p-3 bg-card rounded-xl border border-border text-center">
                <div className="text-2xl font-bold">
                  {Number.parseFloat(String(conversionRate || 0)).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Конверсия</div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="referrals" className="border-none">
                <AccordionTrigger className="py-2 hover:no-underline">
                  <span className="font-medium">Мои рефералы</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {isLoadingReferrals ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : referrals.length > 0 ? (
                      referrals.map((ref) => (
                        <div
                          key={ref.id}
                          className="bg-card rounded-xl border border-border p-3 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                {ref.first_name ||
                                  ref.username ||
                                  "Пользователь"}
                              </div>
                              {ref.username && (
                                <div className="text-xs text-muted-foreground">
                                  @{ref.username}
                                </div>
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className="text-green-500 border-green-500/20 bg-green-500/10"
                            >
                              {ref.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="text-muted-foreground">
                                Заработано
                              </div>
                              <div className="font-medium">{ref.earned} ₽</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">
                                Пополнения
                              </div>
                              <div className="font-medium">{ref.topups}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">
                                Регистрация
                              </div>
                              <div className="font-medium">
                                {ref.registration_date}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">
                                Активность
                              </div>
                              <div className="font-medium">
                                {ref.last_activity}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        У вас пока нет рефералов
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {(inviterBonus || friendBonus) && (
              <p className="text-sm text-muted-foreground text-center">
                Бонус: {inviterBonus || friendBonus}% от пополнений
                приглашённых.
              </p>
            )}

            {referralTerms && Object.keys(referralTerms).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Условия программы</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {referralTerms.minimum_topup_label && (
                    <li>
                      Минимальное пополнение:{" "}
                      {referralTerms.minimum_topup_label}
                    </li>
                  )}
                  {referralTerms.first_topup_bonus_label && (
                    <li>
                      Бонус за первое пополнение:{" "}
                      {referralTerms.first_topup_bonus_label}
                    </li>
                  )}
                  {referralTerms.inviter_bonus_label && (
                    <li>Ваш бонус: {referralTerms.inviter_bonus_label}</li>
                  )}
                  {referralTerms.commission_percent !== undefined && (
                    <li>
                      Комиссия:{" "}
                      {Number(referralTerms.commission_percent)
                        .toFixed(1)
                        .replace(/\.0$/, "")}
                      %
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Правила сервиса</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {(() => {
              const termsCandidates = [
                "https://telegra.ph/Pravila-Dostavka-Vozvrat-i-Konfidencialnost-12-06",
                (userData as any)?.legal_documents?.service_rules?.url,
                (userData as any)?.legal_documents?.terms?.url,
                appConfig?.config?.legal?.terms?.url,
                appConfig?.legal?.terms?.url,
                appConfig?.config?.branding?.termsUrl,
                appConfig?.branding?.termsUrl,
                `${API_BASE}/miniapp/terms`,
                `${API_BASE}/terms`,
                "https://kitsura.fun/terms",
              ].filter(Boolean) as string[];
              const termsUrl = termsCandidates[0];
              const updatedAt =
                (userData as any)?.legal_documents?.service_rules?.updated_at ||
                (userData as any)?.legal_documents?.terms?.updated_at ||
                (userData as any)?.legal_documents?.terms?.updatedAt;
              const updatedLabel = updatedAt
                ? formatDateTimeLabel(updatedAt)
                : "";
              if (termsUrl) {
                return (
                  <div className="space-y-2">
                    {updatedLabel && (
                      <p className="text-xs text-muted-foreground">
                        Обновлено: {updatedLabel}
                      </p>
                    )}
                    <iframe
                      src={termsUrl}
                      className="w-full h-[60vh] border-none"
                    />
                  </div>
                );
              }
              return <p>Правила сервиса доступны на официальном сайте.</p>;
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TopUpModal = ({
  isOpen,
  onClose,
  initData,
}: {
  isOpen: boolean;
  onClose: () => void;
  initData: string;
}) => {
  const [step, setStep] = useState<
    "methods" | "amount" | "processing" | "success" | "error"
  >("methods");
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMethods();
      setStep("methods");
      setError(null);
      setAmount("");
    }
  }, [isOpen]);

  const loadMethods = async () => {
    setLoading(true);
    try {
      const data = await miniappApi.fetchPaymentMethods(initData);
      setMethods(data);
    } catch (err) {
      setError("Не удалось загрузить способы оплаты");
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (method.requires_amount) {
      setStep("amount");
    } else {
      initiatePayment(method);
    }
  };

  const initiatePayment = async (method: PaymentMethod, amountVal?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await miniappApi.createPayment(
        initData,
        method.id,
        amountVal
      );
      if (response.payment_url) {
        setPaymentUrl(response.payment_url);
        window.open(response.payment_url, "_blank");
        setStep("success");
      } else {
        setStep("error");
        setError("Не удалось получить ссылку на оплату");
      }
    } catch (err: any) {
      setStep("error");
      setError(err.message || "Ошибка при создании платежа");
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod || !amount) return;

    const amountKopeks = Math.round(parseFloat(amount) * 100);
    initiatePayment(selectedMethod, amountKopeks);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "methods" && "Пополнение баланса"}
            {step === "amount" && "Введите сумму"}
            {step === "success" && "Платеж создан"}
            {step === "error" && "Ошибка"}
          </DialogTitle>
          <DialogDescription>
            {step === "methods" && "Выберите удобный способ оплаты"}
            {step === "amount" &&
              `Пополнение через ${
                selectedMethod?.title ||
                selectedMethod?.name ||
                (selectedMethod as any)?.label ||
                selectedMethod?.id ||
                "выбранный способ"
              }`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {step === "methods" && (
                <div className="grid gap-3">
                  {methods.map((method) => (
                    <Button
                      key={method.id}
                      variant="outline"
                      className="h-auto py-4 justify-start gap-4"
                      onClick={() => handleMethodSelect(method)}
                    >
                      <div className="text-2xl">{method.icon || "💳"}</div>
                      <div className="text-left">
                        <div className="font-semibold">
                          {method.title ||
                            method.name ||
                            (method as any).label ||
                            method.id}
                        </div>
                        {method.description && (
                          <div className="text-xs text-muted-foreground">
                            {method.description}
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                  {methods.length === 0 && !error && (
                    <div className="text-center text-muted-foreground">
                      Нет доступных способов оплаты
                    </div>
                  )}
                </div>
              )}

              {step === "amount" && (
                <form onSubmit={handleAmountSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Сумма ({selectedMethod?.currency || "RUB"})
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="100"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      autoFocus
                    />
                    {selectedMethod?.min_amount_kopeks && (
                      <p className="text-xs text-muted-foreground">
                        Мин. сумма: {selectedMethod.min_amount_kopeks / 100}{" "}
                        {selectedMethod.currency}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={!amount}>
                    Перейти к оплате
                  </Button>
                </form>
              )}

              {step === "success" && (
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  <div className="p-3 bg-green-100 text-green-600 rounded-full">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Ожидаем оплату</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Мы открыли страницу оплаты в новом окне. После оплаты
                      средства будут зачислены автоматически.
                    </p>
                  </div>
                  {paymentUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(paymentUrl, "_blank")}
                    >
                      Открыть страницу оплаты снова
                    </Button>
                  )}
                </div>
              )}

              {step === "error" && (
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  <div className="p-3 bg-red-100 text-red-600 rounded-full">
                    <AlertCircle className="size-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Ошибка</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {error || "Что-то пошло не так"}
                    </p>
                  </div>
                  <Button onClick={() => setStep("methods")}>
                    Попробовать снова
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function MiniApp() {
  const [activeTab, setActiveTab] = useState("home");
  const {
    user: userData,
    loading: userLoading,
    error: userError,
    fetchUser,
  } = useUser();
  const [appConfig, setAppConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [initData, setInitData] = useState("");
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");

    // Initialize Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      // Force dark theme colors if possible
      if (tg.setHeaderColor) tg.setHeaderColor("#0f172a");
      if (tg.setBackgroundColor) tg.setBackgroundColor("#0f172a");

      setInitData(tg.initData);

      // Fetch initial data
      fetchData(tg.initData);
    } else {
      // Fallback for development outside Telegram
      console.warn("Telegram WebApp not detected");
      fetchData(""); // Load mock data
      toast.info("Режим разработки: используются тестовые данные");
    }
  }, []);

  const fetchData = async (initDataStr: string) => {
    setConfigLoading(true);
    try {
      // Fetch user using the hook
      fetchUser(initDataStr).catch((err: any) =>
        console.error("User fetch failed", err)
      );

      // Fetch config using legacy api for now
      const config = await miniappApi.fetchAppConfig();
      setAppConfig(config);
    } catch (error) {
      console.error("Failed to fetch config:", error);
    } finally {
      setConfigLoading(false);
    }
  };

  const isLoading = userLoading || configLoading;

  return (
    <div className="min-h-screen bg-black text-foreground font-sans selection:bg-primary/20 dark relative flex justify-center">
      <style>{`
        .bg-pattern-dots {
          background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .bg-pattern-grid {
          background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* Desktop background (outside the app container) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        <div className="absolute inset-0 bg-pattern-dots opacity-20" />
      </div>

      {/* App Container */}
      <div className="w-full max-w-md min-h-screen relative bg-background/40 backdrop-blur-xl shadow-2xl overflow-hidden z-10 flex flex-col border-x border-white/5">
        {/* App Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-pattern-grid opacity-30" />
          {/* <div className="absolute inset-0 opacity-50">
            <LightRays
              raysColor="white"
              raysSpeed={1.5}
              lightSpread={0.8}
              rayLength={0.6}
              followMouse={true}
              mouseInfluence={0}
              noiseAmount={0.4}
              distortion={0.05}
              className="custom-rays"
            />
          </div> */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        </div>

        <main className="relative z-10 p-4 pb-28 flex-1 overflow-y-auto custom-scrollbar">
          <div className="absolute inset-0 opacity-50">
            <LightRays
              raysColor="white"
              raysSpeed={1.5}
              lightSpread={0.8}
              rayLength={0.6}
              followMouse={true}
              mouseInfluence={0}
              noiseAmount={0.4}
              distortion={0.05}
              className="custom-rays"
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "home" && (
                <HomeTab
                  userData={userData}
                  isLoading={isLoading}
                  error={userError}
                  onRefresh={() => fetchData(initData)}
                  onOpenInstructions={() => setIsInstructionsOpen(true)}
                  onNavigate={setActiveTab}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              )}
              {activeTab === "subscription" && (
                <SubscriptionTab
                  userData={userData}
                  isLoading={isLoading}
                  initData={initData}
                  onRefresh={() => fetchData(initData)}
                  onNavigate={setActiveTab}
                />
              )}
              {activeTab === "finance" && (
                <FinanceTab
                  userData={userData}
                  isLoading={isLoading}
                  onRefresh={() => fetchData(initData)}
                  onTopUp={() => setIsTopUpOpen(true)}
                  onNavigate={setActiveTab}
                />
              )}
              {activeTab === "settings" && (
                <SettingsTab
                  userData={userData}
                  isLoading={isLoading}
                  onRefresh={() => fetchData(initData)}
                  appConfig={appConfig}
                  initData={initData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <TopUpModal
          isOpen={isTopUpOpen}
          onClose={() => setIsTopUpOpen(false)}
          initData={initData}
        />

        <SubscriptionSettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userData={userData}
          initData={initData}
          onRefresh={() => fetchData(initData)}
        />

        <InstallationModal
          isOpen={isInstructionsOpen}
          onClose={() => setIsInstructionsOpen(false)}
          subscriptionUrl={userData?.subscription_url}
          appConfig={appConfig}
        />
      </div>
      <Toaster />
    </div>
  );
}
