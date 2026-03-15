import type { Language } from "./language";

export default [
  {
    key: "en",
    nativeName: "English",
    prefix: "EN-US",
    enabled: true,
  },
  {
    key: "hi",
    nativeName: "हिन्दी",
    prefix: "HI-IN",
    enabled: true,
  },
  {
    key: "es",
    nativeName: "Español",
    prefix: "ES-ES",
    enabled: false,
  },
  {
    key: "pt-BR",
    nativeName: "Português (Brasil)",
    prefix: "PT-BR",
    enabled: false,
  },
  {
    key: "ar",
    nativeName: "العربية",
    prefix: "AR-SA",
    enabled: false,
  },
  {
    key: "fr",
    nativeName: "Français",
    prefix: "FR-FR",
    enabled: false,
  },
  {
    key: "de",
    nativeName: "Deutsch",
    prefix: "DE-DE",
    enabled: false,
  },
  {
    key: "ja",
    nativeName: "日本語",
    prefix: "JA-JP",
    enabled: false,
  },
  {
    key: "ru",
    nativeName: "Русский",
    prefix: "RU-RU",
    enabled: false,
  },
] as const satisfies Language[];
