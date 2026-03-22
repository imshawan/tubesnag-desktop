import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {
    selectQuality,
    selectSetSavePlaylistFolders,
    setSavePlaylistFolders,
    selectAutoStart,
    selectDownloadPath, selectItemsPerPage, selectRecentItemsPerPage, setQuality, setDownloadPath, setAutoStart,
    setRecentItemsPerPage, setItemsPerPage
} from "@/store/slices/settings-slice";

export function useSettings() {
    const dispatch = useAppDispatch();

    const saveVideosToPlaylistFolders = useAppSelector(selectSetSavePlaylistFolders);
    const quality = useAppSelector(selectQuality);
    const downloadPath = useAppSelector(selectDownloadPath);
    const autoStart = useAppSelector(selectAutoStart);
    const itemsPerPage = useAppSelector(selectItemsPerPage);
    const recentItemsPerPage = useAppSelector(selectRecentItemsPerPage)

    const setSaveVideosToPlaylistFolders = (value: boolean) => {
        dispatch(setSavePlaylistFolders(value));
    };

    const setSelectedQuality = (value: QualityType) => {
        dispatch(setQuality(value));
    }

    const setSelectedDownloadPath = (value: string) => {
        dispatch(setDownloadPath(value));
    }

    const setAutoStartForDownloads = (value: boolean) => {
        dispatch(setAutoStart(value));
    };

    const setRecentDownloadItemsPerPage = (value: number) => {
        dispatch(setRecentItemsPerPage(value));
    }

    const setDownloadItemsPerPage = (value: number) => {
        dispatch(setItemsPerPage(value));
    }

    return {
        itemsPerPage,
        recentItemsPerPage,
        saveVideosToPlaylistFolders,
        quality,
        downloadPath,
        autoStart,
        setSaveVideosToPlaylistFolders,
        setSelectedQuality,
        setSelectedDownloadPath,
        setAutoStartForDownloads,
        setRecentDownloadItemsPerPage,
        setDownloadItemsPerPage
    };
}