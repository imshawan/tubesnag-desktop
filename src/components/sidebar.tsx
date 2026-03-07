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
          label={t("sidebar.dashboard")}
          isActive={activeTab === "dashboard"}
          onClick={() => dispatch(setActiveTab("dashboard"))}
        />
        <NavButton
          icon={Download}
          label={t("sidebar.downloads")}
          isActive={activeTab === "downloads"}
          onClick={() => dispatch(setActiveTab("downloads"))}
        />
        <NavButton
          icon={History}
          label={t("sidebar.history")}
          isActive={activeTab === "history"}
          onClick={() => dispatch(setActiveTab("history"))}
        />
        <NavButton
          icon={Settings}
          label={t("sidebar.settings")}
          isActive={activeTab === "settings"}
          onClick={() => dispatch(setActiveTab("settings"))}
        />
        <NavButton
          icon={HelpCircle}
          label={t("sidebar.help")}
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
