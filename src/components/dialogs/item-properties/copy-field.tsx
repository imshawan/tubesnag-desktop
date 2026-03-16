import {Button} from "@/components/ui/button";
import {Check, Copy} from "lucide-react";

export function CopyField({label, icon: Icon, value, isCopied, onCopy}: any) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
				{label}
			</div>
			<div className="flex items-center gap-2">
				<div
					className="flex-1 truncate rounded-md border bg-background px-3 py-2.5 text-xs font-mono text-muted-foreground shadow-sm select-all">
					{value || "N/A"}
				</div>
				<Button variant="outline" size="icon" className="shrink-0 size-10 shadow-sm" onClick={onCopy}
				        disabled={!value}>
					{isCopied ? <Check className="size-4 text-emerald-500"/> :
						<Copy className="size-4 text-muted-foreground"/>}
				</Button>
			</div>
		</div>
	)
}