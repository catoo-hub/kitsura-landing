import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Ticket, Mail, ShoppingCart, Info } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: number;
  name: string;
}

interface Voucher {
  id: number;
  name: string;
  price: number;
  minPrice: number;
  service: string;
  category: string; // Country
  count: number;
}

export function VouchersForm({
  onSuccess,
  initialServiceName,
}: {
  onSuccess?: () => void;
  initialServiceName?: string | null;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([]);

  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [email, setEmail] = useState("");

  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to calculate price with markup (e.g. 5%)
  const calculatePrice = (basePrice: number) => {
    return Math.ceil(basePrice * 1.05);
  };

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoadingServices(true);
      try {
        const res = await fetch("/api/vouchers/services");
        if (res.ok) {
          const data = await res.json();
          setServices(data);

          // Try to find initial service
          if (initialServiceName) {
            const found = data.find((s: Service) =>
              s.name.toLowerCase().includes(initialServiceName.toLowerCase())
            );
            if (found) {
              setSelectedService(found.id.toString());
              return;
            }
          }

          // Auto-select first service if available and no initial service found
          if (data.length > 0) {
            setSelectedService(data[0].id.toString());
          }
        }
      } catch (e) {
        console.error("Failed to fetch services", e);
        setError("Не удалось загрузить список сервисов");
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch vouchers when service changes
  useEffect(() => {
    if (!selectedService) {
      setVouchers([]);
      setFilteredVouchers([]);
      setCountries([]);
      return;
    }

    const fetchVouchers = async () => {
      setIsLoadingVouchers(true);
      setSelectedVoucher(null);
      setSelectedCountry("all");
      try {
        const res = await fetch(
          `/api/vouchers/list?serviceId=${selectedService}`
        );
        if (res.ok) {
          const data: Voucher[] = await res.json();
          setVouchers(data);

          // Extract unique countries
          const uniqueCountries = Array.from(
            new Set(data.map((v) => v.category))
          ).sort();
          setCountries(uniqueCountries);
          setFilteredVouchers(data);
        }
      } catch (e) {
        console.error("Failed to fetch vouchers", e);
        setError("Не удалось загрузить список ваучеров");
      } finally {
        setIsLoadingVouchers(false);
      }
    };
    fetchVouchers();
  }, [selectedService]);

  // Filter vouchers when country changes
  useEffect(() => {
    if (selectedCountry === "all") {
      setFilteredVouchers(vouchers);
    } else {
      setFilteredVouchers(
        vouchers.filter((v) => v.category === selectedCountry)
      );
    }
    setSelectedVoucher(null);
  }, [selectedCountry, vouchers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucher || !email) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/vouchers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherId: selectedVoucher.id,
          amount: calculatePrice(selectedVoucher.minPrice), // Selling at minPrice + markup
          count: 1,
          email,
          description: `Buying ${selectedVoucher.name}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Произошла ошибка");
      }

      if (data.mock) {
        alert(
          `Это демо-режим (нет API токена).\nСсылка на оплату была бы: ${data.paymentLink}`
        );
        onSuccess?.();
      } else if (data.paymentLink) {
        onSuccess?.();
        setTimeout(() => {
          window.location.href = data.paymentLink;
        }, 100);
      } else {
        throw new Error("Не получена ссылка на оплату");
      }
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при создании заказа");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mx-auto"
    >
      <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(168,85,247,0.15)] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none" />

        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto mb-4 rounded-2xl bg-purple-500/10 p-4 text-purple-500 w-fit ring-1 ring-purple-500/20 shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]">
            <Ticket className="size-8" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Покупка Ваучеров
          </CardTitle>
          <CardDescription className="text-base">
            Подарочные карты и коды пополнения
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Service Selection - Tabs/Cards */}
            <div className="space-y-3 w-full">
              <Label className="text-sm font-medium ml-1">
                Выберите сервис
              </Label>
              {isLoadingServices ? (
                <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Загрузка сервисов...
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service.id.toString())}
                      className={`
                        cursor-pointer rounded-2xl border p-3 text-center transition-all duration-300
                        flex flex-col items-center justify-center gap-3 h-28 relative overflow-hidden group
                        ${
                          selectedService === service.id.toString()
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-100 ring-1 ring-purple-500/30"
                            : "bg-background/40 border-primary/10 hover:bg-background/60 hover:border-primary/30 text-muted-foreground hover:text-foreground hover:shadow-lg"
                        }
                      `}
                    >
                      <div
                        className={`
                        absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300
                        ${
                          selectedService === service.id.toString()
                            ? "opacity-100"
                            : "group-hover:opacity-50"
                        }
                      `}
                      />

                      <div
                        className={`
                        size-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300
                        ${
                          selectedService === service.id.toString()
                            ? "bg-purple-500 text-white shadow-[0_0_15px_-3px_rgba(168,85,247,0.6)] scale-110"
                            : "bg-primary/5 text-primary/40 group-hover:bg-purple-500/20 group-hover:text-purple-400"
                        }
                      `}
                      >
                        {service.name.charAt(0).toUpperCase()}
                      </div>

                      <span className="text-xs font-medium leading-tight line-clamp-2 z-10">
                        {service.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Country Selection (Only if service selected) */}
            {selectedService && countries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label className="text-sm font-medium ml-1">
                  Регион / Страна
                </Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCountry("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      selectedCountry === "all"
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-100"
                        : "bg-background/30 border-primary/10 hover:bg-background/50"
                    }`}
                  >
                    Все регионы
                  </button>
                  {countries.map((country) => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => setSelectedCountry(country)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        selectedCountry === country
                          ? "bg-purple-500/20 border-purple-500/50 text-purple-100"
                          : "bg-background/30 border-primary/10 hover:bg-background/50"
                      }`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Voucher Selection */}
            {selectedService && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label className="text-sm font-medium ml-1">
                  Выберите номинал
                </Label>
                {isLoadingVouchers ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Загрузка товаров...
                  </div>
                ) : filteredVouchers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-primary/10 rounded-xl bg-background/20">
                    Нет доступных товаров для выбранного региона
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredVouchers.map((voucher) => (
                      <div
                        key={voucher.id}
                        onClick={() => setSelectedVoucher(voucher)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 relative overflow-hidden group ${
                          selectedVoucher?.id === voucher.id
                            ? "bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_-5px_rgba(168,85,247,0.3)]"
                            : "bg-background/30 border-primary/5 hover:bg-background/50 hover:border-primary/20"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span
                            className="font-medium text-sm line-clamp-2 leading-snug"
                            title={voucher.name}
                          >
                            {voucher.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className="shrink-0 bg-background/50 text-[10px] px-1.5 h-5"
                          >
                            {voucher.category}
                          </Badge>
                        </div>
                        <div className="mt-auto pt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            В наличии: {voucher.count}
                          </span>
                          <span
                            className={`font-bold ${
                              selectedVoucher?.id === voucher.id
                                ? "text-purple-400"
                                : "text-primary"
                            }`}
                          >
                            {calculatePrice(voucher.minPrice)} ₽
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Email Input */}
            {selectedVoucher && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-sm font-medium ml-1">
                  Email для получения кода
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-11 bg-background/50 border-primary/10 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all rounded-xl"
                  />
                  <Mail className="absolute left-4 top-3.5 size-5 text-muted-foreground/50" />
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Info Block */}
            <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-4">
              <div className="flex items-start gap-3">
                <Info className="size-5 text-purple-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Важная информация
                  </p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>Код активации придет на Email моментально.</li>
                    <li>Активируйте код в настройках вашего аккаунта.</li>
                    <li>
                      Внимательно проверяйте регион аккаунта перед покупкой.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-8">
            <Button
              type="submit"
              className="w-full h-12 text-base rounded-xl hover:opacity-90 transition-all bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)]"
              disabled={isSubmitting || !selectedVoucher || !email}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Купить за{" "}
                  {selectedVoucher
                    ? calculatePrice(selectedVoucher.minPrice)
                    : 0}{" "}
                  ₽
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
