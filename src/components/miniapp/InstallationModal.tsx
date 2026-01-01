import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

interface InstallationModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionUrl?: string;
}

export function InstallationModal({
  isOpen,
  onClose,
  subscriptionUrl,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Настройка VPN</DialogTitle>
          <DialogDescription>
            Выберите ваше устройство для получения инструкции
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="ios"
          value={platform}
          onValueChange={setPlatform}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ios">iOS</TabsTrigger>
            <TabsTrigger value="android">Android</TabsTrigger>
            <TabsTrigger value="windows">Windows</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                1. Скачайте приложение
              </h3>
              {platform === "ios" && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() =>
                    window.open(
                      "https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690",
                      "_blank"
                    )
                  }
                >
                  <Download className="size-4" />
                  Скачать V2Box
                </Button>
              )}
              {platform === "android" && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() =>
                    window.open(
                      "https://play.google.com/store/apps/details?id=com.v2ray.ang",
                      "_blank"
                    )
                  }
                >
                  <Download className="size-4" />
                  Скачать v2rayNG
                </Button>
              )}
              {platform === "windows" && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() =>
                    window.open(
                      "https://github.com/2dust/v2rayN/releases",
                      "_blank"
                    )
                  }
                >
                  <Download className="size-4" />
                  Скачать v2rayN
                </Button>
              )}
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                2. Скопируйте ключ доступа
              </h3>
              <div className="flex gap-2">
                <code className="flex-1 bg-background px-3 py-2 rounded border text-xs font-mono truncate">
                  {subscriptionUrl || "Ключ будет доступен после оплаты"}
                </code>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={copyKey}
                  disabled={!subscriptionUrl}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h3 className="font-medium mb-2">3. Подключитесь</h3>
              <p className="text-sm text-muted-foreground">
                Откройте приложение, оно автоматически предложит добавить ключ
                из буфера обмена. Нажмите "Подключить".
              </p>
            </div>
          </div>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Готово</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
