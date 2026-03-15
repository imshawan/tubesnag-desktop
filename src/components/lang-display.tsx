import { useTranslation } from "react-i18next";
import langs from "@/localization/langs";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export default function LangDisplay() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const currentLanguage = langs.find((lang) => lang.key === currentLang);

  return (
    <ToggleGroup type="single" value={currentLang}>
      <ToggleGroupItem
        size="lg"
        value={currentLang}
        variant="outline"
        disabled
      >
        {currentLanguage?.prefix || "EN-US"}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
