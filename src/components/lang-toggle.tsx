import { useTranslation } from "react-i18next";
import { setAppLanguage } from "@/actions/language";
import langs from "@/localization/langs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Languages } from "lucide-react";

export default function LangToggle() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  function onValueChange(value: string) {
    setAppLanguage(value, i18n);
  }

  const currentLanguage = langs.find((lang) => lang.key === currentLang);

  return (
    <Select value={currentLang} onValueChange={onValueChange}>
      <SelectTrigger className="mt-2">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <SelectValue>
            {currentLanguage?.nativeName || "English"}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {langs.map((lang) => (
          <SelectItem key={lang.key} value={lang.key} disabled={!lang.enabled}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">({lang.prefix})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
