import { faqs } from "@/constants";
import { Download, Zap, HelpCircle, Shield, ChevronDown } from "lucide-react";
import ExternalLink from "@/components/external-link";
import { useTranslation } from "react-i18next";

interface HelpProps {}

export function Help({}: HelpProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
        <div className="text-center space-y-2 mb-4">
          <div className="flex items-center justify-center gap-3">
            <HelpCircle className="size-8 text-primary" />
            <h1 className="text-3xl font-bold">{t("help.title")}</h1>
          </div>
          <p className="text-muted-foreground">
            {t("help.subtitle")}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">{t("help.keyFeatures")}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <Download className="mb-3 size-6 text-primary" />
              <h3 className="mb-1 font-semibold">{t("help.features.multipleModes.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("help.features.multipleModes.description")}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <Zap className="mb-3 size-6 text-primary" />
              <h3 className="mb-1 font-semibold">{t("help.features.lightningFast.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("help.features.lightningFast.description")}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <Shield className="mb-3 size-6 text-primary" />
              <h3 className="mb-1 font-semibold">{t("help.features.private.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("help.features.private.description")}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("help.faq")}</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group rounded-xl border border-border/50 bg-card/50 px-5 py-3 transition-all hover:bg-card/80 open:bg-card open:shadow-sm"
              >
                <summary className="flex cursor-pointer items-center justify-between font-medium outline-none">
                  {faq.question()}
                  <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed animate-in slide-in-from-top-2">
                  {faq.answer()}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-primary/5 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t("help.needMoreHelp")}{" "}
            <ExternalLink
              href="https://github.com/imshawan/tubesnag-desktop"
              className="font-medium text-primary hover:underline"
            >
              {t("help.githubRepo")}
            </ExternalLink>{" "}
            {t("help.additionalResources")}
          </p>
        </div>
      </div>
    </>
  );
}
