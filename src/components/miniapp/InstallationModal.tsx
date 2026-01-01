import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Download,
  ExternalLink,
  Smartphone,
  Monitor,
  Tv,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface InstallationModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionUrl?: string;
  appConfig?: any;
}

export function InstallationModal({
  isOpen,
  onClose,
  subscriptionUrl,
  appConfig,
}: InstallationModalProps) {
  const [platform, setPlatform] = useState("ios");

  const copyKey = () => {
    if (subscriptionUrl) {
      navigator.clipboard.writeText(subscriptionUrl);
      toast.success("Ключ скопирован");
    } else {
      toast.error("Ключ не найден");
    }
  };

  const platforms = [
    { id: "ios", label: "iOS", icon: Smartphone },
    { id: "android", label: "Android", icon: Smartphone },
    { id: "windows", label: "Windows", icon: Monitor },
    { id: "macos", label: "macOS", icon: Monitor },
    { id: "linux", label: "Linux", icon: Monitor },
    { id: "androidTV", label: "Android TV", icon: Tv },
    { id: "appleTV", label: "Apple TV", icon: Tv },
  ];

  const currentApps = appConfig?.platforms?.[platform] || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Настройка VPN</DialogTitle>
          <DialogDescription>
            Выберите ваше устройство для получения инструкции
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-2">
          <Tabs
            defaultValue="ios"
            value={platform}
            onValueChange={setPlatform}
            className="w-full"
          >
            <TabsList className="flex w-full overflow-x-auto justify-start h-auto p-1 gap-1 no-scrollbar">
              {platforms.map((p) => (
                <TabsTrigger key={p.id} value={p.id} className="px-3 py-1.5 text-xs">
                  {p.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
          <div className="space-y-6">
            {/* Key Section */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <h3 className="font-medium mb-2 flex items-center gap-2 text-sm">
                Ваша ссылка на подписку
              </h3>
              <div className="flex gap-2">
                <code className="flex-1 bg-background px-3 py-2 rounded border text-xs font-mono truncate text-muted-foreground">
                  {subscriptionUrl || "Ссылка будет доступна после оплаты"}
                </code>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={copyKey}
                  disabled={!subscriptionUrl}
                  className="shrink-0"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            {/* Apps List */}
            {currentApps.length > 0 ? (
              <div className="space-y-6">
                {currentApps.map((app: any) => (
                  <div key={app.id} className="border rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg">{app.name}</h4>
                      {app.isFeatured && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                          Рекомендуем
                        </Badge>
                      )}
                    </div>

                    {/* Installation */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">1. Установка</h5>
                      <p className="text-sm">{app.installationStep?.description?.ru}</p>
                      <div className="flex flex-wrap gap-2">
                        {app.installationStep?.buttons?.map((btn: any, idx: number) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => window.open(btn.buttonLink, "_blank")}
                          >
                            <Download className="mr-2 size-3" />
                            {btn.buttonText?.ru || "Скачать"}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Setup */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">2. Настройка</h5>
                      <p className="text-sm">{app.addSubscriptionStep?.description?.ru}</p>
                      {subscriptionUrl && (
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            // Try to open app with scheme
                            if (app.urlScheme) {
                                const url = app.urlScheme + encodeURIComponent(subscriptionUrl);
                                window.location.href = url;
                            }
                          }}
                        >
                          Добавить подписку в {app.name}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Инструкции для этой платформы загружаются...
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-background">
          <Button className="w-full" onClick={onClose}>
            Готово
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
