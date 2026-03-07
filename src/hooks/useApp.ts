import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setAppVersion,
  setActiveDialog,
  setSearchOpen,
  toggleSearchOpen,
  setStorage,
} from "@/store/slices/app-slice";
import { setDownloadPath } from "@/store/slices/settings-slice";

export interface UseAppReturn {
  activeTab: string;
  activeDialog: string | null;
  searchOpen: boolean;
  downloadPath: string;
  itemsPerPage: number;
  historySearch: string;
  historyFilter: string;
  setAppVersion: (version: string) => void;
  setActiveDialog: (dialog: DownloadType) => void;
  setSearchOpen: (open: boolean) => void;
  toggleSearchOpen: () => void;
  setStorage: (data: any) => void;
  setDownloadPath: (path: string) => void;
}

export function useApp(): UseAppReturn {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.app.activeTab);
  const activeDialog = useAppSelector((state) => state.app.activeDialog);
  const searchOpen = useAppSelector((state) => state.app.searchOpen);
  const downloadPath = useAppSelector((state) => state.settings.downloadPath);
  const itemsPerPage = useAppSelector((state) => state.app.itemsPerPage);
  const historySearch = useAppSelector((state) => state.app.historySearch);
  const historyFilter = useAppSelector((state) => state.app.historyFilter);

  return {
    activeTab,
    activeDialog,
    searchOpen,
    downloadPath,
    itemsPerPage,
    historySearch,
    historyFilter,
    setAppVersion: (version: string) => dispatch(setAppVersion(version)),
    setActiveDialog: (dialog: DownloadType) => dispatch(setActiveDialog(dialog)),
    setSearchOpen: (open: boolean) => dispatch(setSearchOpen(open)),
    toggleSearchOpen: () => dispatch(toggleSearchOpen()),
    setStorage: (data: any) => dispatch(setStorage(data)),
    setDownloadPath: (path: string) => dispatch(setDownloadPath(path)),
  };
}
