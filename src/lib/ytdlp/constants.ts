import {FileVideo, Monitor, Music, Smartphone, Sparkles, Tv,} from "lucide-react";

interface AudioQuality {
	bitrate: AudioBitrate;
	label: string;
	sub: string;
}

export const VIDEO_QUALITIES: VideoQuality[] = [
	{
		id: "best",
		label: "videoQualities.best.label",
		sub: "videoQualities.best.sub",
		icon: Sparkles
	},
	{
		id: "8k",
		label: "videoQualities.8k.label",
		sub: "videoQualities.8k.sub",
		icon: Sparkles
	},
	{
		id: "4k",
		label: "videoQualities.4k.label",
		sub: "videoQualities.4k.sub",
		icon: Tv
	},
	{
		id: "1440p",
		label: "videoQualities.1440p.label",
		sub: "videoQualities.1440p.sub",
		icon: Tv
	},
	{
		id: "1080p",
		label: "videoQualities.1080p.label",
		sub: "videoQualities.1080p.sub",
		icon: Monitor
	},
	{
		id: "720p",
		label: "videoQualities.720p.label",
		sub: "videoQualities.720p.sub",
		icon: Monitor
	},
	{
		id: "480p",
		label: "videoQualities.480p.label",
		sub: "videoQualities.480p.sub",
		icon: Smartphone
	},
	{
		id: "360p",
		label: "videoQualities.360p.label",
		sub: "videoQualities.360p.sub",
		icon: Smartphone
	},
	{
		id: "240p",
		label: "videoQualities.240p.label",
		sub: "videoQualities.240p.sub",
		icon: Smartphone
	},
	{
		id: "144p",
		label: "videoQualities.144p.label",
		sub: "videoQualities.144p.sub",
		icon: Smartphone
	},
	{
		id: "audio",
		label: "videoQualities.audio.label",
		sub: "videoQualities.audio.sub",
		icon: Music
	},
];

export const DOWNLOAD_FORMATS = [
	{
		value: "mp4",
		label: "downloadFormats.mp4",
		sub: "downloadFormats.mp4Sub",
		icon: FileVideo
	},
	{
		value: "webm",
		label: "downloadFormats.webm",
		sub: "downloadFormats.webmSub",
		icon: FileVideo
	},
	{
		value: "mkv",
		label: "downloadFormats.mkv",
		sub: "downloadFormats.mkvSub",
		icon: FileVideo
	},
	{
		value: "mp3",
		label: "downloadFormats.mp3",
		sub: "downloadFormats.mp3Sub",
		icon: Music
	},
	{
		value: "m4a",
		label: "downloadFormats.m4a",
		sub: "downloadFormats.m4aSub",
		icon: Music
	},
	{
		value: "wav",
		label: "downloadFormats.wav",
		sub: "downloadFormats.wavSub",
		icon: Music
	},
] as const;

export const AUDIO_BITRATES: Record<AudioBitrate, AudioQuality> = {
	"128": {
		bitrate: "128",
		label: "audioBitrates.128.label",
		sub: "audioBitrates.128.description"
	},
	"192": {
		bitrate: "192",
		label: "audioBitrates.192.label",
		sub: "audioBitrates.192.description"
	},
	"256": {
		bitrate: "256",
		label: "audioBitrates.256.label",
		sub: "audioBitrates.256.description"
	},
	"320": {
		bitrate: "320",
		label: "audioBitrates.320.label",
		sub: "audioBitrates.320.description"
	}
};

export const DOWNLOAD_FORMAT_TYPES: Record<FormatType, string> = {
	"mp4": "video",
	"webm": "video",
	"mkv": "video",
	"mp3": "audio",
	"m4a": "audio",
	"wav": "audio",
} as const;

export const audioFormats: FormatType[] = Object.entries(DOWNLOAD_FORMAT_TYPES)
	.filter(e => e[1] === "audio").map(e => e[0] as FormatType);

export const DEPENDENCY_CONFIG = {
	ytDlp: {
		win32: {
			url: "https://github.com/yt-dlp/yt-dlp/releases/download/2026.03.03/yt-dlp.exe",
			filename: "yt-dlp.exe"
		},
		unix: {url: "https://github.com/yt-dlp/yt-dlp/releases/download/2026.03.03/yt-dlp", filename: "yt-dlp"},
	},
	ffmpeg: {
		win32: {filename: "ffmpeg.exe"},
		linux: {filename: "ffmpeg"},
		darwin: {filename: "ffmpeg"},
	},
};

export const downloadQualityMap: Record<QualityType, string[]> = {
	best: ["bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best[height<=1440][ext=mp4]+bestaudio/best[height<=1080][ext=mp4]+bestaudio/best[ext=mp4]"],
	"8k": ["bestvideo[height<=4320][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=2160][ext=mp4]+bestaudio/best[ext=mp4]"],
	"4k": ["bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1440][ext=mp4]+bestaudio/bestvideo[height<=1080][ext=mp4]+bestaudio/best[ext=mp4]"],
	"1440p": ["bestvideo[height<=1440][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080][ext=mp4]+bestaudio/bestvideo[height<=720][ext=mp4]+bestaudio/best[ext=mp4]"],
	"1080p": ["bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720][ext=mp4]+bestaudio/bestvideo[height<=480][ext=mp4]+bestaudio/best[ext=mp4]"],
	"720p": ["bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=480][ext=mp4]+bestaudio/best[ext=mp4]"],
	"480p": ["bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=360][ext=mp4]+bestaudio/best[ext=mp4]"],
	"360p": ["bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]"],
	"240p": ["bestvideo[height<=240][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=144][ext=mp4]+bestaudio/best[ext=mp4]"],
	"144p": ["bestvideo[height<=144][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]"],
	audio: ["bestaudio"], // Audio: just get bestaudio, conversion happens via flags
	unknown: ["best[ext=mp4]/best"] // Unknown / Fallback: try best mp4, then best of any format
};

export const ytDlpErrorMap: Record<string, string> = {
	"not a bot": "ytDlpErrors.botVerification",
	"Requested format is not available": "ytDlpErrors.formatUnavailable",
	"Video unavailable": "ytDlpErrors.videoUnavailable",
	"Private video": "ytDlpErrors.privateVideo",
	"age-restricted": "ytDlpErrors.ageRestricted",
	"No such file or directory": "ytDlpErrors.directoryMissing",
	"HTTP Error 403": "ytDlpErrors.geoBlocked",
	"HTTP Error 404": "ytDlpErrors.notFound",
	"Connection refused": "ytDlpErrors.networkFailed",
	"Playlist is empty": "ytDlpErrors.playlistEmpty",
};

export const downloadItemJsonInfoStructure = `{
    "title":"%(title)s.%(ext)s",
    "channel":"%(channel)s",
    "ext":"%(ext)s",
    "filesize":%(filesize)j,
    "filesize_approx":%(filesize_approx)j,
    "format_id":"%(format_id)s",
    "format":"%(format)s",
    "quality":"%(height)sp",
    "width": %(width)j,
    "height": %(height)j,
    "video_codec": "%(vcodec)s",
    "audio_codec": "%(acodec)s",
    "audio_bitrate": %(abr)j,
    "audio_sample_rate": %(asr)j,
    "audio_ext": "%(audio_ext)s"
}`;