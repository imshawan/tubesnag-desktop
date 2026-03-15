import {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {ScrollArea} from "./ui/scroll-area";
import {cn} from "@/lib/utils/tailwind";
import {Film, Music, Play, Search} from "lucide-react";
import {formatBytes} from "@/lib/utils/common";

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    data: any[];
    onSelect: (item: any) => void;
}

export function GlobalSearch({isOpen, onClose, data, onSelect}: GlobalSearchProps) {
    const {t} = useTranslation();
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery("");
        }
    }, [isOpen]);

    const filtered = data.filter(
        (item: any) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.channel.toLowerCase().includes(query.toLowerCase()),
    );

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 px-4 pt-20 backdrop-blur-sm transition-all animate-in fade-in duration-200">
            <div className="fixed inset-0 z-40" onClick={onClose}/>
            <div
                className="relative z-50 flex w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border/50 bg-popover shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center border-b border-border/40 px-4">
                    <Search className="mr-2 size-5 text-muted-foreground opacity-50"/>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex h-14 w-full rounded-md bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={t("globalSearch.placeholder")}
                    />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <kbd
                            className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                            {t("globalSearch.esc")}
                        </kbd>
                        <span>{t("globalSearch.toClose")}</span>
                    </div>
                </div>

                <ScrollArea className="h-[350px] w-full">
                    <div className="p-2">
                        {filtered.length === 0 ? (
                            <div className="py-14 text-center text-sm text-muted-foreground">
                                {t("globalSearch.noResults")}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                    {t("globalSearch.results")} ({filtered.length})
                                </div>
                                {filtered.map((item: any) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            onSelect(item);
                                            onClose();
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground group"
                                    >
                                        <div
                                            className={cn(
                                                "flex size-10 shrink-0 items-center justify-center rounded-md border border-border/50",
                                                item.type === "audio"
                                                    ? "bg-purple-500/10 text-purple-500"
                                                    : "bg-blue-500/10 text-blue-500",
                                            )}
                                        >
                                            {item.type === "audio" ? (
                                                <Music className="size-5"/>
                                            ) : (
                                                <Film className="size-5"/>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col overflow-hidden">
                                            <span className="truncate font-medium">{item.title}</span>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{item.channel}</span>
                                                <span>•</span>
                                                <span>{formatBytes(item.size)}</span>
                                                <span>•</span>
                                                <span
                                                    className={cn(
                                                        item.status === "completed"
                                                            ? "text-emerald-500"
                                                            : item.status === "failed"
                                                                ? "text-rose-500"
                                                                : "text-amber-500",
                                                    )}
                                                >
                          {item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)}
                        </span>
                                            </div>
                                        </div>
                                        <Play
                                            className="size-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"/>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
