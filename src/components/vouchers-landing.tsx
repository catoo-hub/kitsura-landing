import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VouchersForm } from "./vouchers-form";
import { motion } from "motion/react";
import {
  Ticket,
  ShieldCheck,
  Zap,
  Globe,
  Gift,
  ArrowRight,
  MapPin,
  Tag,
  Percent,
  Lock,
  Headphones,
} from "lucide-react";
import { FaqAccordion } from "./faq-accordion";
import LightRays from "./LightRays";
import { Card, CardContent } from "@/components/ui/card";

export function VouchersLanding() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleOpen = (serviceName?: string) => {
    setSelectedPreset(serviceName || null);
    setIsOpen(true);
  };

  const popularProducts = [
    {
      name: "Valorant Points",
      service: "Valorant",
      description:
        "Пополняйте счет Valorant Points для покупки скинов, боевого пропуска и агентов. Доступны различные номиналы для всех регионов.",
      region: "Турция (TR), Европа (EU)",
      price: "от 350 ₽",
      image: "/Services/Valorant.png",
      color: "from-red-500/20 to-red-900/20",
      textColor: "text-red-400",
      buttonColor: "bg-red-600 hover:bg-red-700",
    },
    {
      name: "Fortnite V-Bucks",
      service: "Fortnite",
      description:
        "В-баксы для покупки экипировки, кирок, оберток, эмоций и боевых пропусков. Самые выгодные цены на рынке.",
      region: "Глобальный (Global)",
      price: "от 450 ₽",
      image: "/Services/Fortnite.png",
      color: "from-blue-500/20 to-blue-900/20",
      textColor: "text-blue-400",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Spotify Premium",
      service: "Spotify",
      description:
        "Подписка Spotify Premium без рекламы, с возможностью скачивания треков и прослушивания офлайн. Индивидуальные и семейные планы.",
      region: "Турция (TR), Индия (IN)",
      price: "от 150 ₽",
      image: "/Services/Spotify.png",
      color: "from-green-500/20 to-green-900/20",
      textColor: "text-green-400",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    {
      name: "PlayStation Store",
      service: "PlayStation",
      description:
        "Карты пополнения бумажника PSN. Покупайте игры, дополнения и подписки PS Plus напрямую в магазине PlayStation.",
      region: "Турция (TR), Польша (PL), США (US)",
      price: "от 1000 ₽",
      image: "/Services/PlayStation.png",
      color: "from-indigo-500/20 to-indigo-900/20",
      textColor: "text-indigo-400",
      buttonColor: "bg-indigo-600 hover:bg-indigo-700",
    },
  ];
  const features = [
    {
      title: "Мгновенная доставка",
      description: "Код активации придет на вашу почту сразу после оплаты.",
      icon: Zap,
    },
    {
      title: "Официальные коды",
      description: "Мы продаем только лицензионные ключи и карты пополнения.",
      icon: ShieldCheck,
    },
    {
      title: "Глобальный выбор",
      description:
        "Поддержка сервисов и регионов со всего мира (US, EU, TR и др.).",
      icon: Globe,
    },
    {
      title: "Выгодные цены",
      description:
        "Мы регулярно мониторим рынок, чтобы предложить вам лучшие цены без скрытых наценок.",
      icon: Percent,
    },
    {
      title: "Безопасная оплата",
      description:
        "Все транзакции защищены современными протоколами шифрования. Ваши данные в безопасности.",
      icon: Lock,
    },
    {
      title: "Поддержка 24/7",
      description:
        "Наша команда готова помочь вам с любым вопросом в любое время суток.",
      icon: Headphones,
    },
  ];

  const faqData = [
    {
      question: "Как активировать код?",
      answer:
        "Инструкция по активации приходит вместе с кодом на вашу почту. Обычно это делается в настройках аккаунта соответствующего сервиса (Steam, Spotify, iTunes и т.д.).",
    },
    {
      question: "Что делать, если код не пришел?",
      answer: (
        <>
          Проверьте папку 'Спам'. Письмо отправляется автоматически сразу после
          оплаты. Если письма нет в течение 5 минут, напишите в нашу{" "}
          <a
            href="https://t.me/torroixq"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80 transition-colors"
          >
            службу поддержки
          </a>
          .
        </>
      ),
    },
    {
      question: "Можно ли вернуть товар?",
      answer:
        "Цифровые товары надлежащего качества возврату не подлежат после получения кода, так как мы не можем проверить, был ли он использован. Если код окажется невалидным (что крайне маловероятно), мы сделаем замену.",
    },
    {
      question: "Нужен ли VPN для активации?",
      answer:
        "Зависит от региона ваучера. Если вы покупаете карту для Турции (TR) или Аргентины (ARS), вам может понадобиться IP-адрес соответствующей страны для активации.",
    },
    {
      question: "Какие способы оплаты доступны?",
      answer:
        "Мы принимаем банковские карты и СБП. Все платежи проходят через защищенный шлюз.",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <div className="relative">
        <LightRays
          raysOrigin="top-center"
          raysColor="purple" // Changed to purple for distinction
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
            <Badge
              variant="secondary"
              className="px-4 py-1 text-sm mb-8 bg-purple-500/10 text-purple-400 border-purple-500/20"
            >
              <Gift className="mr-2 size-4" />
              Подарочные карты и подписки
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl max-w-4xl"
          >
            Магазин{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Цифровых Товаров
            </span>
            <br />
            <span className="text-muted-foreground">Игры, Музыка, Кино</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Покупайте ваучеры Steam, Spotify, iTunes, Valorant и сотен других
            сервисов. Доступны любые регионы. Моментальная отправка на Email.
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
                  onClick={() => handleOpen()}
                  className="h-14 text-lg px-10 rounded-full shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] hover:shadow-[0_0_60px_-10px_rgba(168,85,247,0.7)] transition-all duration-300 hover:scale-105 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Ticket className="mr-2 size-5" />
                  Выбрать товар
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 bg-transparent border-none shadow-none [&>button]:hidden custom-scrollbar z-[1001]">
                <DialogTitle className="sr-only">Покупка ваучера</DialogTitle>
                <DialogDescription className="sr-only">
                  Форма выбора и покупки цифрового товара
                </DialogDescription>
                <VouchersForm
                  onSuccess={() => setIsOpen(false)}
                  initialServiceName={selectedPreset}
                />
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
              <StatItem number="100+" label="Сервисов" delay={0.1} />
              <StatItem number="0%" label="Скрытых комиссий" delay={0.2} />
              <StatItem number="1 мин" label="Доставка" delay={0.3} />
              <StatItem number="24/7" label="Поддержка" delay={0.4} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Popular Products - ZigZag Layout */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center mb-16">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Популярные товары
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Самые востребованные сервисы и подписки
          </p>
        </div>

        <div className="flex flex-col gap-24">
          {popularProducts.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`flex flex-col lg:flex-row gap-8 lg:gap-16 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image Side */}
              <div
                className="w-full lg:w-1/2 relative group cursor-pointer"
                onClick={() => handleOpen(product.service)}
              >
                <div
                  className={`absolute -inset-4 bg-gradient-to-r ${product.color} opacity-20 blur-2xl rounded-[3rem] group-hover:opacity-30 transition-opacity duration-500`}
                />
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500 z-10" />
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full lg:w-1/2 flex flex-col gap-6 items-start text-left">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-white/5 border border-white/10 ${product.textColor}`}
                  >
                    <Ticket className="size-6" />
                  </div>
                  <h3 className="text-3xl font-bold">{product.name}</h3>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.description}
                </p>

                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-full border border-white/5">
                    <MapPin className="size-4" />
                    {product.region}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-full border border-white/5">
                    <Tag className="size-4" />
                    {product.price}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    size="lg"
                    onClick={() => handleOpen(product.service)}
                    className={`h-12 px-8 text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${product.buttonColor} text-white border-none`}
                  >
                    Купить сейчас
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
            Мы гарантируем валидность каждого проданного кода.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20">
                    <feature.icon className="size-6" />
                  </div>
                  <h3 className="font-semibold text-xl">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 mb-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold sm:text-4xl mb-4">
            Частые вопросы
          </h2>
          <p className="text-muted-foreground">
            Ответы на популярные вопросы о покупке ваучеров
          </p>
        </div>
        <FaqAccordion faq={faqData} />
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="flex flex-col items-center justify-center"
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
