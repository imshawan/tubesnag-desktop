import { useActiveDownloads } from "@/hooks/useActiveDownloads";
import { useApp } from "@/hooks/useApp";
import { Loader2, Download, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/tailwind";

export function ActiveDownloadsBanner() {
	const { currentDownloads, currentDownloadId, downloadSpeed } = useActiveDownloads();
	const { setActiveTab, activeTab } = useApp();

	if (activeTab === "downloads") {
		return null;
	}

	return (
		<div
			className={cn(
				"fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out",
				// The slide in/out animation logic
				currentDownloadId
					? "translate-y-0 opacity-100 scale-100"
					: "translate-y-24 opacity-0 scale-95 pointer-events-none"
			)}
		>
			<div
				// Clicking the banner takes them right to the downloads tab
				onClick={() => setActiveTab("downloads")}
				className="group flex items-center gap-4 bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-full pl-2 pr-5 py-2 cursor-pointer hover:bg-accent/50 transition-colors"
			>
				{/* Spinning Icon Ring */}
				<div className="relative flex items-center justify-center size-10 rounded-full bg-blue-500/10 text-blue-500 shrink-0">
					<Loader2 className="size-10 animate-[spin_3s_linear_infinite] absolute opacity-20" />
					<Loader2 className="size-10 animate-spin absolute opacity-50" style={{ animationDirection: 'reverse', animationDuration: '4s' }} />
					<Download className="size-4" />
				</div>

				{/* Status Text */}
				<div className="flex flex-col min-w-[140px]">
                    <span className="text-sm font-semibold text-foreground leading-none mb-1.5 tracking-tight">
                        Downloading {currentDownloads.length - 1} item{currentDownloads.length === 1 ? '' : 's'}...
                    </span>

					{/* Live Metrics */}
					<div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono tracking-wider uppercase">
						{downloadSpeed.length > 0 && (
							<>
								<span className="opacity-40">•</span>
								<span className="text-blue-500">{downloadSpeed}</span>
							</>
						)}
					</div>
				</div>

				{/* Call to action arrow */}
				<ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
			</div>
		</div>
	);
}