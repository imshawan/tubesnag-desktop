import type React from "react";
import DragWindowRegion from "@/components/drag-window-region";
import { DownloadProvider } from "@/context/DownloadContext";
import { ToastProvider } from "@/context/ToastContext";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <DownloadProvider>
        <DragWindowRegion title="TubeSnag" />
        <main className="h-screen">{children}</main>
      </DownloadProvider>
    </ToastProvider>
  );
}
