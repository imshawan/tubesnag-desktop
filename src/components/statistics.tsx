import {StatCard} from "@/components/stat-card";
import {AlertCircle, CheckCircle2, HardDrive, Zap} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useActiveDownloads} from "@/hooks/useActiveDownloads";
import {useDownloads} from "@/hooks/useDownloads";
import {formatBytes} from "@/lib/utils/common";
import {useMemo} from "react";

export function Statistics() {
    const { t } = useTranslation();
    const {downloadCount, isDownloading, failedDownloadsCount} = useActiveDownloads();
    const {totalSize, completedDownloads} = useDownloads();

    const sizeString = useMemo(() => formatBytes(totalSize), [totalSize]);

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                icon={Zap}
                label={t("dashboard.activeTasks")}
                value={downloadCount}
                colorClass="text-amber-500"
                subtext={
                    isDownloading ? t("dashboard.processing") : t("dashboard.idle")
                }
            />
            <StatCard
                icon={CheckCircle2}
                label={t("dashboard.completed")}
                value={completedDownloads.length}
                colorClass="text-emerald-500"
                subtext={t("dashboard.allTime")}
            />
            <StatCard
                icon={HardDrive}
                label={t("dashboard.totalSize")}
                value={sizeString}
                colorClass="text-blue-500"
                subtext={t("dashboard.savedLocally")}
            />
            <StatCard
                icon={AlertCircle}
                label={t("dashboard.failed")}
                value={failedDownloadsCount}
                colorClass="text-rose-500"
                subtext={t("dashboard.requiresAttention")}
            />
        </div>
    )

}