import { Sparkles, TimerReset, Lock } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import LightRays from "./LightRays";

const heroHighlights = [
  { label: "Подключение", value: "за 5 секунд" },
  { label: "Скорость", value: "до 10 Гбит/с" },
  { label: "Устройств", value: "неограниченно" },
];

export function Hero() {
  return (
    <div className="relative">
      <LightRays
        raysOrigin="top-center"
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
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
          <div className="space-y-8">
            <Badge variant="secondary" className="px-4 py-1 text-sm">
              ⚜️ Подключение за секунды · ✈️ Высокая скорость · 📺 Любое
              устройство
            </Badge>
            <div className="relative space-y-6">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Твой реально быстрый VPN с честными тарифами
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                Прозрачные цены, автоматическая выдача ключей и забота о
                скорости. Выбирай город и получай доступ к зарубежным сервисам,
                играм и приватности без ограничений.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="h-12 rounded-full px-8 text-base">
                <a
                  href="https://t.me/kitsura_bot"
                  target="_blank"
                  rel="noreferrer"
                >
                  Купить доступ
                </a>
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full px-8 text-base"
              >
                <a href="#pricing">Смотреть тарифы</a>
              </Button>
            </div>
            <dl className="grid gap-4 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm">
                  <dt className="text-sm text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="text-xl font-semibold">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Card className="rounded-3xl border-border/70 bg-gradient-to-b from-background/95 to-card/80 p-6 shadow-[0px_20px_80px_rgba(15,23,42,0.18)]">
            <CardHeader className="gap-4">
              <Badge variant="outline" className="w-fit">
                24/7 uptime
              </Badge>
              <CardTitle className="text-2xl">
                Защита, которой доверяют
              </CardTitle>
              <CardDescription>
                Пингуем сервера каждую минуту, держим резервные сервера и
                молниеносно исправляем проблемы.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  Активные подключения
                </span>
                <span className="text-2xl font-semibold">158</span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="size-4 text-primary" /> Стабильные
                  обновления инфраструктуры
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <TimerReset className="size-4 text-primary" /> Среднее время
                  выдачи ключа — 12 секунд
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="size-4 text-primary" /> Логи отключены на
                  уровне сервера
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Попробовать бесплатно</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
