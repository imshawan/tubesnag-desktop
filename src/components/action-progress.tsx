import {Loader2} from "lucide-react";

interface ActionProgressProps {
	message: string;
	visible: boolean;
}

export function ActionProgress({message, visible}: Readonly<ActionProgressProps>) {
	if (!visible) {
		return null;
	}
	return (
		<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
			<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/80 shadow-sm border mb-4">
				<Loader2 className="size-6 animate-spin text-primary" />
			</div>
			<p className="text-sm font-medium text-foreground">{message}</p>
		</div>
	)
}