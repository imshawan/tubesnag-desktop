import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  DownloadCloud,
  Loader2, Maximize2, Pause, Play,
  Power,
  Rocket, Settings,
  Settings2,
  Sparkles,
  Zap
} from "lucide-react";
import LangToggle from "@/components/lang-toggle";
import ToggleTheme from "@/components/toggle-theme";
import type { DependencyStatus } from "@/types/index";
import { installDependencies } from "@/utils/setup";
import {cn} from "@/utils/tailwind";

type SetupStatus = "checking" | "installing" | "complete";

function SetupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<SetupStatus>("checking");
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    const handleProgress = (data: { dependency: string; progress: number }) => {
      if (data.progress >= 0) {
        const deps = ['db', 'ytdlp', 'ffmpeg'];
        const avgProgress = Math.round((data.progress + (deps.length - 1) * 100) / deps.length);
        setOverallProgress(prev => Math.max(prev, Math.min(avgProgress, 99)));
      }
    };

    globalThis.electron?.onInstallProgress?.(handleProgress);
    return () => {
      globalThis.electron?.offInstallProgress?.(handleProgress);
    };
  }, []);

  const runSetup = async () => {
    try {
      setStatus("installing");
      const result = await installDependencies();
      if (result?.ytdlp && result?.ffmpeg) {
        setOverallProgress(100);
        setStatus("complete");
        setTimeout(() => navigate({ to: "/" }), 1500);
      }
    } catch (error) {
      console.error("Setup error:", error);
    }
  };
  const onLaunch = () => navigate({ to: "/" });

  const isComplete = status === "complete";

  useEffect(() => {
    if (isComplete && onLaunch) {
      // Trigger navigation immediately
      onLaunch();
    }
  }, [isComplete, onLaunch]);
  useEffect(() => {
    runSetup();
  }, [navigate]);

  return (
      <div
          className="relative flex h-screen w-full flex-col bg-background text-foreground overflow-hidden font-sans selection:bg-red-500/20">

        {/* 1. SCREEN CONTENT (Center Stage) */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-6">

          {/* Background Ambient Gradient (Theme Aware) */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Center Spot */}
            <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] transition-colors duration-1000",
                isComplete ? "bg-emerald-500/10" : "bg-red-500/5"
            )} />

            {/* Dot Pattern */}
            <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
          </div>

          {/* Central Visual: Audio Visualizer Bars */}
          <div className="relative z-10 flex items-end gap-1.5 h-32 mb-10">
            {[...Array(10)].map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "w-4 rounded-full transition-all duration-700 ease-in-out shadow-sm",
                        isComplete
                            ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                            : "bg-foreground/80 dark:bg-foreground animate-pulse"
                    )}
                    style={{
                      // Wave pattern when complete, random when installing
                      height: isComplete
                          ? `${40 + Math.sin(i) * 20}%`
                          : `${Math.max(15, Math.random() * 100)}%`,
                      animationDuration: `${0.4 + Math.random() * 0.5}s`,
                      opacity: isComplete ? 1 : 0.8
                    }}
                />
            ))}
          </div>

          {/* Text Status */}
          <div className="z-10 text-center space-y-3 transition-all duration-500">
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              {isComplete ? (
                  <>
                    <span>Launching TubeSnag</span>
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </>
              ) : (
                  "Installing Engine..."
              )}
            </h1>

            {/* Only show detail text if NOT complete (cleaner look on transition) */}
            {!isComplete && (
                <div className="flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
                  <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">
                    {Math.round(overallProgress)}% Processed
                  </p>
                </div>
            )}
          </div>

        </div>


        {/* 2. PLAYER CONTROLS (Bottom Bar) - HIDDEN WHEN COMPLETE */}
        <div className={cn(
            "relative z-30 mb-8 shrink-0 bg-card/80 backdrop-blur-md border-t border-border px-8 py-6 transition-all duration-500 ease-in-out",
            isComplete ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
        )}>

          {/* Progress Line (Seeker) */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted cursor-wait group overflow-hidden">
            <div
                className="h-full relative bg-red-600 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
            >
              {/* Glow effect at tip */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-8 bg-red-500 blur-xl rounded-full opacity-50" />
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-6 text-muted-foreground">
              <Pause className="size-6 animate-pulse text-red-600 fill-current" />
              <div className="flex items-center gap-2 text-sm font-mono tracking-tight">
                <span className="text-foreground">00:{Math.floor((overallProgress / 100) * 60).toString().padStart(2, '0')}</span>
                <span className="opacity-50">/</span>
                <span className="opacity-50">01:00</span>
              </div>
            </div>

            <div className="flex items-center gap-5 text-muted-foreground">
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider bg-muted px-2.5 py-1 rounded-md text-foreground">
                <Zap className="size-3 text-yellow-500 fill-current" />
                <span>HD 4K</span>
              </div>
              <Settings className="size-5 hover:text-foreground transition-colors cursor-pointer" />
              <Maximize2 className="size-5 hover:text-foreground transition-colors cursor-pointer" />
            </div>
          </div>
        </div>

      </div>
  );
}

export const Route = createFileRoute("/setup")({
  component: SetupPage,
});
