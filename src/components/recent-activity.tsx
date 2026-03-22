import {Clock} from "lucide-react";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {useDownloads} from "@/hooks/useDownloads";
import {DownloadList} from "@/components/download-list";
import {useApp} from "@/hooks/useApp";
import {useSettings} from "@/hooks/useSettings";
import {useMemo} from "react";
import {cn} from "@/lib/utils/tailwind";

interface RecentActivityProps {
	onOpenFile: (download: DownloadItem) => void;
	onOpenFolder: (download: DownloadItem) => void;
	onRetry: (download: DownloadItem) => void;
	onDelete: (download: DownloadItem, downloadListType: DownloadListType) => void;
	onShare: (download: DownloadItem) => void;
}

export function RecentActivity({onOpenFile, onOpenFolder, onRetry, onDelete, onShare}: Readonly<RecentActivityProps>) {
	const {t} = useTranslation();
	const {downloads} = useDownloads();
	const {setActiveTab} = useApp();
	const {recentItemsPerPage} = useSettings();

	const items = useMemo(() => [...downloads].splice(0, (recentItemsPerPage + 1)), [downloads]);

	return (
		<div className="flex flex-col h-125 rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
			<div className="flex items-center justify-between border-b border-border/50 px-6 py-4 bg-muted/10 shrink-0">
				<h3 className="font-medium">{t("recentActivity.title")}</h3>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setActiveTab("history")}
					className="h-7 text-xs text-muted-foreground hover:text-foreground"
				>
					{t("recentActivity.viewAll")}
				</Button>
			</div>

			<div className="bg-background/50 p-0 flex-1 overflow-hidden relative">
				{items.length > 0 ? (
					<>
						<DownloadList
							items={items}
							onRetry={onRetry}
							onDelete={onDelete}
							onShare={onShare}
							onOpenFolder={onOpenFolder}
							onOpenFile={onOpenFile}
							maxHeight="h-full"
							downloadListType="completed"
							maxItems={recentItemsPerPage}
						/>

						<div
							className="pointer-events-none absolute bottom-0 left-0 right-0 h-18 flex items-end justify-center z-10 transition-all duration-300 overflow-hidden">
							<div className={cn(
								"absolute inset-0 z-0",
								// The core frosting: heavy blur + dynamic backdrop color stain
								"backdrop-blur-[6px] mask-[linear-gradient(to_top,black_20%,transparent_100%)]",

								// Dark mode frosting (deep blur, subtle stain)
								"dark:bg-background/70 dark:[backdrop-filter:blur(6px)_saturate(1)]",

								// Light mode frosting (fresher blur, cleaner stain)
								"bg-white [backdrop-filter:blur(6px)_saturate(1.2)]",

								// The optional solid bottom edge for total masking
								"after:absolute after:bottom-0 after:left-0 after:right-0 after:h-12 after:bg-background/90 after:content-['']"
							)}/>

						</div>
					</>
				) : (
					<div className="flex h-full flex-col items-center justify-center space-y-2 text-muted-foreground">
						<Clock className="size-6 text-muted-foreground/30"/>
						<p className="text-sm">{t("recentActivity.noRecentDownloads")}</p>
					</div>
				)}
			</div>
		</div>
	);
}
