import {cn} from "@/lib/utils/tailwind";

export function DetailItem({icon: Icon, label, value, mono, capitalize}: any) {
	return (
		<div className="py-2">
			<dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
				<Icon className="size-3.5"/>
				{label}
			</dt>
			<dd className={cn(
				"text-sm font-medium text-foreground",
				mono && "font-mono text-xs truncate",
				capitalize && "capitalize"
			)} title={mono ? value : undefined}>
				{value}
			</dd>
		</div>
	)
}