import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {
    selectQuality,
    selectSetSavePlaylistFolders,
    setSavePlaylistFolders,
    selectAutoStart,
    selectDownloadPath
} from "@/store/slices/settings-slice";

export function useSettings() {
    const dispatch = useAppDispatch();

    const saveVideosToPlaylistFolders = useAppSelector(selectSetSavePlaylistFolders);
    const quality = useAppSelector(selectQuality);
    const downloadPath = useAppSelector(selectDownloadPath);
    const autoStart = useAppSelector(selectAutoStart);


    const setSaveVideosToPlaylistFolders = (value: boolean) => {
        dispatch(setSavePlaylistFolders(value));
    };

    return {
        saveVideosToPlaylistFolders,
        quality,
        downloadPath,
        autoStart,
        setSaveVideosToPlaylistFolders
    };
}