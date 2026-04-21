import type { i18n } from "i18next";
import { AppSettingsKeys } from "@/lib/utils/enums";

export function setAppLanguage(lang: string, i18n: i18n) {
  localStorage.setItem(AppSettingsKeys.LANGUAGE, lang);
  i18n.changeLanguage(lang);
  document.documentElement.lang = lang;
}

export function updateAppLanguage(i18n: i18n) {
  const localLang = localStorage.getItem(AppSettingsKeys.LANGUAGE);
  if (!localLang) {
    return;
  }

  i18n.changeLanguage(localLang);
  document.documentElement.lang = localLang;
}
