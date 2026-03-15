import { useTranslation } from "react-i18next";

interface StorageIndicatorProps {
  used: string;
  total: string;
  percentage: number;
}

export function StorageIndicator({ used, total, percentage }: Readonly<StorageIndicatorProps>) {
  const { t } = useTranslation();

  if (percentage === 0 && used === "0" && total === "0") {
    return null; // Don't render the indicator if there's no storage data
  }

  return (
    <div className="mt-auto mb-8 rounded-xl border border-border/50 bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("storageIndicator.storage")}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground">
        {used} GB {t("storageIndicator.usedOf")} {total} GB
      </div>
    </div>
  );
}
