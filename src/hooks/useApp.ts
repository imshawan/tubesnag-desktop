import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {
	selectActiveDialog,
	selectActiveTab,
	selectAppVersion,
	selectHistoryFilter,
	selectHistorySearch,
	selectHistoryTypeFilter,
	selectSearchOpen,
	selectStateSaving, selectStateSavingProgress,
	selectStorage,
	setActiveDialog,
	setActiveTab,
	setAppVersion,
	setHistoryFilter,
	setHistorySearch,
	setHistoryTypeFilter,
	setSearchOpen,
	setStateSaving, setStateSavingProgress,
	setStorage,
	toggleSearchOpen,
} from "@/store/slices/app-slice";

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
	const isAppStateSaving = useAppSelector(selectStateSaving);
	const appStateSavingProgress = useAppSelector(selectStateSavingProgress);

	return {
		activeTab,
		appVersion,
		storage,
		activeDialog,
		searchOpen,
		historySearch,
		historyFilter,
		historyTypeFilter,
		isAppStateSaving,
		appStateSavingProgress,
		setAppVersion: (version: string) => dispatch(setAppVersion(version)),
		setActiveTab: (tab: string) => dispatch(setActiveTab(tab)),
		setActiveDialog: (dialog: DownloadType) => dispatch(setActiveDialog(dialog)),
		setSearchOpen: (open: boolean) => dispatch(setSearchOpen(open)),
		toggleSearchOpen: () => dispatch(toggleSearchOpen()),
		setStorage: (data: any) => dispatch(setStorage(data)),
		setHistorySearch: (search: string) => dispatch(setHistorySearch(search)),
		setHistoryFilter: (filter: string) => dispatch(setHistoryFilter(filter)),
		setHistoryTypeFilter: (filter: string) => dispatch(setHistoryTypeFilter(filter)),
		setIsAppStateSaving: (value: boolean) => dispatch(setStateSaving(value)),
		setAppStateSavingProgress: (value: number) => dispatch(setStateSavingProgress(value)),
	};
}
