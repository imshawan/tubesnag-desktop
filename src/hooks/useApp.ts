import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {
	selectActiveDialog,
	selectActiveTab,
	selectAppVersion, selectHistoryFilter, selectHistorySearch, selectHistoryTypeFilter,
	selectSearchOpen,
	selectStorage,
	setActiveDialog,
	setActiveTab,
	setAppVersion, setHistoryFilter, setHistorySearch, setHistoryTypeFilter,
	setSearchOpen,
	setStorage,
	toggleSearchOpen,
} from "@/store/slices/app-slice";
import {setDownloadPath} from "@/store/slices/settings-slice";

export function useApp() {
	const dispatch = useAppDispatch();

	const activeTab = useAppSelector(selectActiveTab);
	const activeDialog = useAppSelector(selectActiveDialog);
	const searchOpen = useAppSelector(selectSearchOpen);
	const historySearch = useAppSelector(selectHistorySearch);
	const historyFilter = useAppSelector(selectHistoryFilter);
	const appVersion = useAppSelector(selectAppVersion);
	const storage = useAppSelector(selectStorage);
	const historyTypeFilter = useAppSelector(selectHistoryTypeFilter);

	return {
		activeTab,
		appVersion,
		storage,
		activeDialog,
		searchOpen,
		historySearch,
		historyFilter,
		historyTypeFilter,
		setAppVersion: (version: string) => dispatch(setAppVersion(version)),
		setActiveTab: (tab: string) => dispatch(setActiveTab(tab)),
		setActiveDialog: (dialog: DownloadType) => dispatch(setActiveDialog(dialog)),
		setSearchOpen: (open: boolean) => dispatch(setSearchOpen(open)),
		toggleSearchOpen: () => dispatch(toggleSearchOpen()),
		setStorage: (data: any) => dispatch(setStorage(data)),
		setDownloadPath: (path: string) => dispatch(setDownloadPath(path)),
		setHistorySearch: (search: string) => dispatch(setHistorySearch(search)),
		setHistoryFilter: (filter: string) => dispatch(setHistoryFilter(filter)),
		setHistoryTypeFilter: (filter: string) => dispatch(setHistoryTypeFilter(filter)),
	};
}
