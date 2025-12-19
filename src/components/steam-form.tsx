import { useState } from "react";
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
import { Loader2, Gamepad2, Wallet } from "lucide-react";
import { motion } from "motion/react";

export function SteamForm({ onSuccess }: { onSuccess?: () => void }) {
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/steam/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountName, amount: Number(amount) }),
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
        // Small delay to allow dialog to close before redirecting
        setTimeout(() => {
          window.location.href = data.paymentLink;
        }, 100);
      } else {
        throw new Error("Не получена ссылка на оплату");
      }
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при создании заказа");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(14,165,233,0.15)] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mx-auto mb-4 rounded-2xl bg-primary/10 p-4 text-primary w-fit ring-1 ring-primary/20 shadow-[0_0_20px_-5px_rgba(14,165,233,0.3)]">
            <Gamepad2 className="size-8" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Пополнение Steam
          </CardTitle>
          <CardDescription className="text-base">
            Моментальное зачисление средств на ваш кошелек
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accountName" className="text-sm font-medium ml-1">
                Логин Steam
              </Label>
              <div className="relative">
                <Input
                  id="accountName"
                  placeholder="Введите логин"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  className="h-12 pl-11 bg-background/50 border-primary/10 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
                />
                <Gamepad2 className="absolute left-4 top-3.5 size-5 text-muted-foreground/50" />
              </div>
              <p className="text-[11px] text-muted-foreground ml-1 flex items-center gap-1.5">
                <span className="inline-block size-1 rounded-full bg-primary/50" />
                Это логин для входа, не никнейм!
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium ml-1">
                Сумма пополнения (₽)
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  min="100"
                  max="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="h-12 pl-11 bg-background/50 border-primary/10 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
                />
                <Wallet className="absolute left-4 top-3.5 size-5 text-muted-foreground/50" />
              </div>
              <div className="flex gap-2 mt-2">
                {[100, 300, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className="text-xs px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary transition-colors border border-primary/10"
                  >
                    {val} ₽
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="pt-6 pb-8">
            <Button
              type="submit"
              className="w-full h-12 text-base rounded-xl hover:opacity-80 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Обработка...
                </>
              ) : (
                "Пополнить счет"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
