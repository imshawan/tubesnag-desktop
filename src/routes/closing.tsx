import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, PowerOff, Save } from "lucide-react";
import { cn } from "@/lib/utils/tailwind";
import { useApp } from "@/hooks/useApp";

type ClosingStatus = "saving" | "complete";

function ClosingPage() {
	const { t } = useTranslation();
	const [status, setStatus] = useState<ClosingStatus>("saving");
	const { appStateSavingProgress } = useApp();

	const isComplete = status === "complete";

	useEffect(() => {
		if (appStateSavingProgress >= 100 && status !== "complete") {
			setStatus("complete");
		}
	}, [appStateSavingProgress, status]);

	return (
		<div className="relative flex h-screen w-full flex-col bg-background text-foreground overflow-hidden font-sans selection:bg-blue-500/20">

			{/* SCREEN CONTENT */}
			<div className="relative flex-1 flex flex-col items-center justify-center p-6">

				{/* Background Ambient Gradient (Theme Aware) */}
				<div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
					{/* Center Spot - Shifts from saving (blue) to shutting down (dim/neutral) */}
					<div
						className={cn(
							"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] transition-all duration-1000 ease-in-out",
							isComplete ? "bg-muted/10 scale-90 opacity-0" : "bg-blue-500/10 scale-100 opacity-100"
						)}
					/>

					{/* Dot Pattern - Fades out on complete */}
					<div
						className={cn(
							"absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] transition-opacity duration-1000",
							isComplete ? "opacity-0" : "opacity-[0.15]"
						)}
					/>
				</div>

				{/* Central Visual: Data Saving / Spin Down Animation */}
				<div className="relative z-10 flex items-end gap-1.5 h-32 mb-10">
					{new Array(7).map((_, i) => (
						<div
							key={i}
							className={cn(
								"w-4 rounded-full transition-all duration-1000 ease-in-out shadow-sm",
								isComplete
									? "bg-muted-foreground/20 h-2 shadow-none" // Collapsed state
									: "bg-blue-500/80 dark:bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]" // Saving state
							)}
							style={{
								// Rhythmically pulsing height to represent saving data
								height: isComplete ? "8px" : `${30 + Math.sin(Date.now() / 200 + i) * 30 + 40}%`,
								animation: isComplete ? "none" : `pulse ${1 + (i * 0.1)}s infinite alternate`,
								opacity: isComplete ? 0.2 : 0.9,
							}}
						/>
					))}
				</div>

				{/* Text Status */}
				<div className={cn(
					"z-10 flex flex-col items-center space-y-4 transition-all duration-700",
					isComplete ? "translate-y-4" : "translate-y-0"
				)}>

					<div className="flex items-center gap-3">
						{isComplete ? (
							<PowerOff className="size-6 text-muted-foreground animate-out fade-out duration-1000" />
						) : (
							<Save className="size-5 text-blue-500 animate-pulse" />
						)}

						<h1 className={cn(
							"text-2xl font-bold tracking-tight transition-colors duration-500",
							isComplete ? "text-muted-foreground" : "text-foreground"
						)}>
							{isComplete ? t("app.shuttingDown", "Shutting down...") : t("app.savingState", "Saving workspace...")}
						</h1>
					</div>

					{/* Subtitle / Progress indicator */}
					<div className={cn(
						"flex items-center justify-center gap-2 transition-opacity duration-300",
						isComplete ? "opacity-0" : "opacity-100"
					)}>
						<Loader2 className="size-3.5 animate-spin text-muted-foreground" />
						<p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">
							{Math.round(appStateSavingProgress)}% — {t("app.pleaseWait", "Please do not force quit")}
						</p>
					</div>
				</div>

			</div>
		</div>
	);
}

export const Route = createFileRoute("/closing")({
	component: ClosingPage,
});