import {
  Sparkles,
  Monitor,
  Smartphone,
  Music,
  Tv,
} from "lucide-react";
import i18n from "i18next";

export const LOCAL_STORAGE_KEYS = {
  LANGUAGE: "lang",
  THEME: "theme",
};

export const IPC_CHANNELS = {
  START_ORPC_SERVER: "start-orpc-server",
};

export const VIDEO_QUALITIES = [
  {
    id: "best",
    label: () => i18n.t("videoQualities.best.label"),
    sub: () => i18n.t("videoQualities.best.sub"),
    icon: Sparkles
  },
  { id: "4k", label: () => i18n.t("videoQualities.4k.label"), sub: () => i18n.t("videoQualities.4k.sub"), icon: Tv },
  {
    id: "high",
    label: () => i18n.t("videoQualities.high.label"),
    sub: () => i18n.t("videoQualities.high.sub"),
    icon: Monitor
  },
  {
    id: "medium",
    label: () => i18n.t("videoQualities.medium.label"),
    sub: () => i18n.t("videoQualities.medium.sub"),
    icon: Smartphone
  },
  {
    id: "audio",
    label: () => i18n.t("videoQualities.audio.label"),
    sub: () => i18n.t("videoQualities.audio.sub"),
    icon: Music
  },
];

export const DOWNLOAD_FORMATS = [
  { value: "mp4", label: () => i18n.t("downloadFormats.mp4") },
  { value: "webm", label: () => i18n.t("downloadFormats.webm") },
  { value: "mkv", label: () => i18n.t("downloadFormats.mkv") },
  { value: "mp3", label: () => i18n.t("downloadFormats.mp3") },
  { value: "m4a", label: () => i18n.t("downloadFormats.m4a") },
  { value: "wav", label: () => i18n.t("downloadFormats.wav") },
] as const;

export const faqs = [
    {
      question: () => i18n.t("faqs.0.question"),
      answer: () => i18n.t("faqs.0.answer"),
    },
    {
      question: () => i18n.t("faqs.1.question"),
      answer: () => i18n.t("faqs.1.answer"),
    },
    {
      question: () => i18n.t("faqs.2.question"),
      answer: () => i18n.t("faqs.2.answer"),
    },
  ] as const;