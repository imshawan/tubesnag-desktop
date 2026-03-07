import { LayoutGrid, History, Settings, HelpCircle, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/app-header";
import { NavButton } from "@/components/nav-button";
import { StorageIndicator } from "@/components/storage-indicator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveTab } from "@/store/slices/app-slice";

export function Sidebar() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  
  const appVersion = useAppSelector((state) => state.app.appVersion);
  const activeTab = useAppSelector((state) => state.app.activeTab);
  const storage = useAppSelector((state) => state.app.storage);

  return (
    <aside className="flex w-64 flex-col gap-2 relative h-full border-r border-border/40 bg-muted/10 p-4">
      <AppHeader appName={t("appName")} appVersion={appVersion} />
      <div className="space-y-1">
        <NavButton
          icon={LayoutGrid}
          label="Dashboard"
          isActive={activeTab === "dashboard"}
          onClick={() => dispatch(setActiveTab("dashboard"))}
        />
        <NavButton
          icon={Download}
          label="Downloads"
          isActive={activeTab === "downloads"}
          onClick={() => dispatch(setActiveTab("downloads"))}
        />
        <NavButton
          icon={History}
          label="History"
          isActive={activeTab === "history"}
          onClick={() => dispatch(setActiveTab("history"))}
        />
        <NavButton
          icon={Settings}
          label="Settings"
          isActive={activeTab === "settings"}
          onClick={() => dispatch(setActiveTab("settings"))}
        />
        <NavButton
          icon={HelpCircle}
          label="Help"
          isActive={activeTab === "help"}
          onClick={() => dispatch(setActiveTab("help"))}
        />
      </div>
      <StorageIndicator
        used={storage.used}
        total={storage.total}
        percentage={storage.percentage}
      />
    </aside>
  );
}
