import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SteamForm } from "./steam-form";
import { motion } from "motion/react";
import { Wallet, ShieldCheck, Zap, Globe, Gamepad2, Check } from "lucide-react";
import { FaqAccordion } from "./faq-accordion";
import LightRays from "./LightRays";

export function SteamLanding() {
  const [isOpen, setIsOpen] = useState(false);
  const [topupsCount, setTopupsCount] = useState<string>("15k+");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.steamTopups) {
            // Format number with spaces (e.g. 15 423)
            setTopupsCount(
              new Intl.NumberFormat("ru-RU").format(data.steamTopups)
            );
          }
        }
      } catch (e) {
        console.error("Failed to fetch stats", e);
      }
    };

    fetchStats();
  }, []);

  const faqData = [
    {
      question: "Это безопасно?",
      answer:
        "Абсолютно. Мы не запрашиваем пароль от вашего аккаунта. Пополнение происходит только по логину Steam, который является публичной информацией.",
    },
    {
      question: "Как узнать свой логин?",
      answer:
        "Логин — это то, что вы вводите при входе в Steam. Это НЕ ваш никнейм, который видят другие игроки. Вы можете найти его в настройках аккаунта Steam (Об аккаунте).",
    },
    {
      question: "Какие регионы поддерживаются?",
      answer:
        "Мы поддерживаем пополнение аккаунтов большинства стран СНГ (Россия, Казахстан, Украина, Беларусь) и многих других. Если ваш регион не поддерживается, средства вернутся автоматически.",
    },
    {
      question: "Как быстро приходят деньги?",
      answer:
        "Обычно зачисление происходит моментально (в течение 1-2 минут). В редких случаях возможны задержки до 15 минут из-за нагрузки на серверы Steam.",
    },
    {
      question: "Есть ли комиссия?",
      answer:
        "Да, комиссия составляет всего 11.5%. Это значительно ниже, чем у большинства конкурентов (Банки, Kupikod, WebMoney, Donatov.net). Точную сумму к оплате вы увидите перед подтверждением платежа.",
    },
  ];

  const features = [
    {
      title: "Моментально",
      description:
        "Автоматическая система зачисления. Деньги приходят в течение 1-2 минут.",
      icon: Zap,
    },
    {
      title: "Безопасно",
      description:
        "Никаких паролей. Для пополнения нам нужен только ваш логин Steam.",
      icon: ShieldCheck,
    },
    {
      title: "СНГ и Мир",
      description:
        "Пополняем аккаунты России, Казахстана, Турции и других стран.",
      icon: Globe,
    },
  ];

  const vpnPerks = [
    "Минимальный пинг в играх",
    "Обход любых блокировок",
    "Бесплатный тестовый период",
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
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
        <section className="relative z-10 mx-auto max-w-6xl flex flex-col gap-12 px-4 py-16 sm:px-6 lg:px-8 lg:py-24 text-center items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="px-4 py-1 text-sm mb-8">
              <Gamepad2 className="mr-2 size-4" />
              Работаем 24/7 · Моментальное зачисление
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl max-w-4xl"
          >
            Пополнение{" "}
            <span className="bg-gradient-to-r from-[#1b2838] to-[#2a475e] dark:from-[#66c0f4] dark:to-[#1b2838] bg-clip-text text-transparent">
              Steam
            </span>
            <br />
            <span className="text-muted-foreground">Быстро и Безопасно</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Моментальное зачисление средств на ваш кошелек Steam. Комиссия всего
            11.5% (ниже рынка). Пополнение только по логину, никаких паролей.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="h-14 text-lg px-10 rounded-full shadow-[0_0_40px_-10px_rgba(14,165,233,0.5)] hover:shadow-[0_0_60px_-10px_rgba(14,165,233,0.7)] transition-all duration-300 hover:scale-105"
                >
                  <Wallet className="mr-2 size-5" />
                  Пополнить сейчас
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] p-0 bg-transparent border-none shadow-none [&>button]:hidden">
                <SteamForm onSuccess={() => setIsOpen(false)} />
              </DialogContent>
            </Dialog>
          </motion.div>
        </section>
      </div>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <Card className="rounded-3xl border-border/70 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <StatItem number={topupsCount} label="Пополнений" delay={0.1} />
              <StatItem number="2 мин" label="Среднее время" delay={0.2} />
              <StatItem number="99.9%" label="Успешно" delay={0.3} />
              <StatItem number="24/7" label="Поддержка" delay={0.4} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto space-y-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <Badge variant="secondary" className="mx-auto">
            Преимущества
          </Badge>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Почему выбирают нас?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Мы сделали процесс пополнения максимально простым и прозрачным.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="rounded-3xl border-border/70 bg-card/90"
            >
              <CardHeader className="flex-col items-center text-center gap-4">
                <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                  <feature.icon className="size-8" />
                </div>
                <div>
                  <CardTitle className="text-xl mb-2">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto space-y-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <Badge variant="secondary" className="mx-auto">
            Как это работает
          </Badge>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Всего 3 простых шага
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <StepCard
            number="1"
            title="Введите логин"
            description="Укажите ваш логин Steam (тот, что используете для входа)."
            delay={0.2}
          />
          <StepCard
            number="2"
            title="Выберите сумму"
            description="Укажите сумму пополнения. Мы автоматически конвертируем валюту."
            delay={0.4}
          />
          <StepCard
            number="3"
            title="Получите средства"
            description="Оплатите удобным способом и деньги сразу поступят на счет."
            delay={0.6}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto max-w-5xl space-y-8 px-4 py-16 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col gap-4 text-center">
          <Badge variant="secondary" className="mx-auto">
            FAQ
          </Badge>
          <h2 className="text-3xl font-semibold sm:text-4xl">Частые вопросы</h2>
        </div>
        <FaqAccordion faq={faqData} />
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto max-w-5xl space-y-8 px-4 py-16 sm:px-6 lg:px-8 mb-8">
        <Card className="rounded-3xl border-primary/40 bg-gradient-to-br from-primary/10 via-background to-background/80 p-8 text-center shadow-[0px_25px_90px_rgba(46,70,85,0.25)]">
          <CardHeader className="space-y-4">
            <Badge variant="secondary" className="mx-auto w-fit">
              Kitsura VPN
            </Badge>
            <CardTitle className="text-3xl sm:text-4xl">
              Играйте без ограничений
            </CardTitle>
            <CardDescription className="text-base max-w-2xl mx-auto">
              Нужен VPN для смены региона Steam или доступа к заблокированным
              играм? Наш VPN сервис обеспечивает высокую скорость и стабильное
              соединение.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-center">
              <Button className="h-11 rounded-full px-6" asChild>
                <a
                  href="https://t.me/kitsura_bot"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Zap className="mr-2 size-4" />
                  Попробовать VPN бесплатно
                </a>
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-full px-6"
                asChild
              >
                <a
                  href="https://t.me/kitsuravpn"
                  target="_blank"
                  rel="noreferrer"
                >
                  Наш Telegram канал
                </a>
              </Button>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-6">
              {vpnPerks.map((perk, index) => (
                <li
                  key={index}
                  className="flex items-center justify-center gap-2"
                >
                  <Check className="size-4 text-primary" /> {perk}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatItem({
  number,
  label,
  delay,
}: {
  number: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, type: "spring" }}
      className="flex flex-col items-center"
    >
      <span className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent mb-2">
        {number}
      </span>
      <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </span>
    </motion.div>
  );
}

function StepCard({
  number,
  title,
  description,
  delay,
}: {
  number: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="relative flex flex-col items-center text-center z-10"
    >
      <div className="w-24 h-24 rounded-full bg-background border-4 border-card flex items-center justify-center text-3xl font-bold mb-6 relative group">
        <span className="bg-gradient-to-br from-primary to-blue-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
          {number}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-xs">{description}</p>
    </motion.div>
  );
}
