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
import { toast } from "sonner";
import { miniappApi } from "@/lib/miniapp-api";
import type {
  UserData,
  PaymentMethod,
  PurchaseOptions,
  PurchasePeriod,
} from "@/lib/types";
import { InstallationModal } from "./InstallationModal";
import { useUser } from "@/hooks/useUser";
import { useSubscriptionPurchase } from "@/hooks/useSubscriptionPurchase";
import { useSubscriptionSettings } from "@/hooks/useSubscriptionSettings";
import { useSubscriptionAutopay } from "@/hooks/useSubscriptionAutopay";

// --- Types ---
interface TabProps {
  userData: UserData | null;
  isLoading: boolean;
  error?: any;
  onRefresh: () => void;
  onOpenInstructions?: () => void;
  onNavigate?: (tab: string) => void;
}

interface FinanceTabProps extends TabProps {
  onTopUp: () => void;
}

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
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border/50 pb-safe pt-2 px-6 z-50">
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
          <AvatarImage src="" />
          <AvatarFallback>
            {userData.user.first_name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Status Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-background overflow-hidden relative">
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
            <p className="text-sm text-muted-foreground mb-4">
              Подписка активна. Наслаждайтесь безопасным интернетом.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">
              Подписка не найдена. Подключите VPN для защиты.
            </p>
          )}

          <Button
            className="w-full shadow-lg shadow-primary/20"
            size="lg"
            onClick={
              hasActiveSubscription
                ? onOpenInstructions
                : () => onNavigate?.("subscription")
            }
          >
            {hasActiveSubscription ? "Настроить VPN" : "Подключить VPN"}
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

const SubscriptionTab = ({ userData, isLoading, onRefresh }: TabProps) => {
  const {
    purchaseOptions,
    loadingOptions,
    purchasing,
    error,
    successMsg,
    previewPrice,
    calculatingPreview,
    loadOptions,
    calculatePreview,
    purchaseSubscription,
    setError,
    setSuccessMsg,
  } = useSubscriptionPurchase();

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Constructor state
  const [isConstructorMode, setIsConstructorMode] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState<
    string | number | null
  >(null);
  const [selectedServers, setSelectedServers] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (userData && tg?.initData) {
      loadOptions(tg.initData).then((options: any) => {
        if (options && options.periods && options.periods.length > 0) {
          setSelectedPeriodId(options.periods[0].id);
        }
      });
    }
  }, [userData, loadOptions]);

  // Effect to calculate preview when constructor options change
  useEffect(() => {
    if (isConstructorMode && selectedPeriodId) {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initData) {
        calculatePreview(
          tg.initData,
          selectedPeriodId,
          Array.from(selectedServers),
          1
        );
      }
    }
  }, [isConstructorMode, selectedPeriodId, selectedServers, calculatePreview]);

  const handlePurchase = async (
    periodId: string | number,
    isCustom: boolean = false
  ) => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.initData) return;

    // If purchasing a standard tariff, ensure we don't accidentally use selected servers from constructor
    if (!isCustom) {
      // We can't easily clear state synchronously.
      // Ideally submitPurchase should accept full overrides.
      // For now, we rely on the user not having set servers if they are in standard view.
      // Or we can force clear them in the hook if we passed a flag.
    }

    try {
      await submitPurchase(periodId);
      setSuccessMsg("Подписка успешно оформлена!");
      onRefresh();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      // Error handled by hook state usually, but we can log
      console.error(err);
    }
  };

  const handlePromoActivate = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoMessage(null);
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (!tg?.initData) return;

      const result = await miniappApi.activatePromoCode(tg.initData, promoCode);
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
    const tg = (window as any).Telegram?.WebApp;
    // Try to find subscription ID in various places
    const subId =
      userData?.subscription?.id || userData?.subscriptionId || userData?.id;

    if (!tg?.initData || !subId) {
      console.error("Missing initData or subscription ID for autopay toggle");
      return;
    }

    await updateAutopaySettings(tg.initData, subId, { enabled });
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
                      {plan.discount_percent && (
                        <span className="text-xs text-green-500 font-medium">
                          -{plan.discount_percent}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {plan.final_price_kopeks
                          ? (plan.final_price_kopeks / 100).toFixed(0)
                          : plan.price_kopeks
                          ? (plan.price_kopeks / 100).toFixed(0)
                          : 0}{" "}
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
                      {purchaseOptions?.periods.map((plan: any) => (
                        <div
                          key={plan.id}
                          onClick={() =>
                            setSelections((prev) => ({
                              ...prev,
                              periodId: plan.id,
                            }))
                          }
                          className={`
                            cursor-pointer rounded-lg p-2 text-center border transition-all
                            ${
                              selections.periodId === plan.id
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border hover:border-primary/50"
                            }
                          `}
                        >
                          <div className="text-sm">{getPeriodLabel(plan)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Server selection */}
                  {purchaseOptions?.servers?.available &&
                    purchaseOptions.servers.available.length > 0 && (
                      <div className="space-y-2">
                        <Label>
                          Локации (
                          {selections.servers.size > 0
                            ? selections.servers.size
                            : "Все"}
                          )
                        </Label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                          {purchaseOptions.servers.available.map(
                            (server: any) => {
                              const isSelected = selections.servers.has(
                                server.uuid
                              );
                              return (
                                <div
                                  key={server.uuid}
                                  onClick={() => {
                                    const newSet = new Set(selections.servers);
                                    if (isSelected) {
                                      newSet.delete(server.uuid);
                                    } else {
                                      newSet.add(server.uuid);
                                    }
                                    setSelections((prev) => ({
                                      ...prev,
                                      servers: newSet,
                                    }));
                                  }}
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
                                    {server.name}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Выберите нужные локации. Если ничего не выбрано, будут
                          доступны все.
                        </p>
                      </div>
                    )}

                  <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Итоговая стоимость
                      </span>
                      <span className="text-xl font-bold">
                        {calculatingPreview ? (
                          <Loader2 className="size-4 animate-spin inline" />
                        ) : (
                          <>
                            {preview?.price
                              ? (preview.price / 100).toFixed(0)
                              : (purchaseOptions?.periods.find(
                                  (p: any) => p.id === selections.periodId
                                )?.final_price_kopeks || 0) / 100}{" "}
                            {purchaseOptions?.currency}
                          </>
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

  return (
    <div className="space-y-6 pb-24">
      <h2 className="text-2xl font-bold">Финансы</h2>

      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-none">
        <CardContent className="p-6">
          <div className="flex flex-col gap-1">
            <span className="text-gray-400 text-sm">Ваш баланс</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{userData.balance}</span>
              <span className="text-xl text-gray-400">
                {userData.balance_currency}
              </span>
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
          <div className="text-center py-8 text-muted-foreground text-sm">
            История операций пуста
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsTab = ({
  userData,
  isLoading,
  appConfig,
}: TabProps & { appConfig?: any }) => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  if (isLoading || !userData) return null;

  const menuItems = [
    { icon: Users, label: "Реферальная система", badge: "New" },
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
            ID: {userData.user.id}
          </p>
        </div>
        <Button variant="ghost" size="icon">
          <LogOut className="size-5 text-muted-foreground" />
        </Button>
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

      {userData.referral && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-sm">
                Ваша реферальная ссылка
              </span>
              <div className="flex gap-2">
                <code className="flex-1 bg-background/50 rounded-lg px-3 py-2 text-xs font-mono flex items-center text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                  {userData.referral.link}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(userData.referral!.link);
                    toast.success("Ссылка скопирована");
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Приглашайте друзей и получайте бонусы.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Правила сервиса</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {appConfig?.config?.branding?.termsUrl ? (
              <iframe
                src={appConfig.config.branding.termsUrl}
                className="w-full h-[60vh] border-none"
              />
            ) : (
              <p>Правила сервиса доступны на официальном сайте.</p>
            )}
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
            {step === "amount" && `Пополнение через ${selectedMethod?.title}`}
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
                          {method.title || method.name}
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

  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <div className="max-w-md mx-auto min-h-screen relative bg-background shadow-2xl overflow-hidden">
        <main className="p-4 h-full overflow-y-auto custom-scrollbar">
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
                />
              )}
              {activeTab === "subscription" && (
                <SubscriptionTab
                  userData={userData}
                  isLoading={isLoading}
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
