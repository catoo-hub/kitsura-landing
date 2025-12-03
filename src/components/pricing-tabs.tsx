import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "lucide-react";

type Tier = {
  term: string;
  price: string;
  note: string;
  featured?: boolean;
};

type Location = {
  id: string;
  city: string;
  country: string;
  flagLabel: string;
  speed: string;
  description: string;
  suits: string[];
  types: string[];
  tiers: Tier[];
  guarantee: string;
};

interface PricingTabsProps {
  locations: Location[];
}

export function PricingTabs({ locations }: PricingTabsProps) {
  if (!locations.length) {
    return null;
  }

  return (
    <Tabs defaultValue={locations[0]?.id} className="space-y-6">
      <TabsList className="mx-auto flex flex-wrap justify-center gap-3 bg-transparent p-0">
        {locations.map((location) => (
          <TabsTrigger
            key={location.id}
            value={location.id}
            className="rounded-full border border-border/70 px-4 py-2 text-sm"
          >
            <span className="font-semibold">{location.city}</span>
            <span className="text-muted-foreground text-xs">
              {location.country}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      {locations.map((location) => (
        <TabsContent
          key={location.id}
          value={location.id}
          className="space-y-6"
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-3xl border-border/70 bg-card/90">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs tracking-wide">
                    {location.flagLabel}
                  </Badge>
                  <div>
                    <CardTitle className="text-2xl">{location.city}</CardTitle>
                    <CardDescription>{location.country}</CardDescription>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {location.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-2xl bg-muted/40 p-4">
                  <p className="text-sm text-muted-foreground">Скорость</p>
                  <p className="text-2xl font-semibold">{location.speed}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Подойдёт для:</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {location.suits.map((suit) => (
                      <li
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                        key={suit}
                      >
                        <Check className="mt-0.5 size-4 text-primary" />
                        <span>{suit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Типы подключения:</p>
                  <div className="flex flex-wrap gap-2">
                    {location.types.map((type) => (
                      <Badge
                        key={`${location.id}-${type}`}
                        variant="secondary"
                        className="bg-secondary/40"
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  {location.guarantee}
                </p>
              </CardFooter>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {location.tiers.map((tier) => (
                <Card
                  key={`${location.id}-${tier.term}`}
                  className={`rounded-3xl border-border/70 ${
                    tier.featured ? "border-primary/60 bg-primary/5" : "bg-card"
                  }`}
                >
                  <CardHeader className="gap-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{tier.term}</Badge>
                      {tier.featured && (
                        <Badge className="bg-primary text-primary-foreground">
                          Топ
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-3xl font-semibold">
                      {tier.price}
                    </CardTitle>
                    <CardDescription>{tier.note}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="size-4 text-primary" /> Нет
                        ограничений по устройствам
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-4 text-primary" /> Моментальная
                        выдача
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-4 text-primary" /> Смена сервера
                        бесплатно
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <a
                        href="https://t.me/kitsura_bot"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Купить
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
