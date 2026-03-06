import type React from "react";
import DragWindowRegion from "@/components/drag-window-region";
import { DownloadProvider } from "@/context/DownloadContext";
import { ToastProvider } from "@/context/ToastContext";
import { Provider } from "react-redux";
import { store } from "@/store";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <ToastProvider>
        <DownloadProvider>
          <DragWindowRegion title="TubeSnag" />
          <main className="h-screen">{children}</main>
        </DownloadProvider>
      </ToastProvider>
    </Provider>
  );
}
