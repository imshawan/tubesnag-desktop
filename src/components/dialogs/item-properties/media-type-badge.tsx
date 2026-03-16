import {Badge} from "@/components/ui/badge"
import {cn} from "@/lib/utils/tailwind"
import {FileVideo, ListVideo, Music} from "lucide-react"

interface MediaTypeBadgeProps {
	type: DownloadItemType
	format?: string
	className?: string
}

export function MediaTypeBadge({type, format, className}: Readonly<MediaTypeBadgeProps>) {

	const getTypeIcon = () => {
		if (type === "audio") return Music
		if (type === "playlist") return ListVideo
		return FileVideo
	}

	const TypeIcon = getTypeIcon()

	return (
		<Badge
			variant="outline"
			className={cn(
				"capitalize flex w-fit items-center gap-1.5 px-2 py-0.5 shadow-sm border",
				// Distinct colors for each type
				type === "video" && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
				type === "audio" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
				type === "playlist" && "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
				className
			)}
		>
			<TypeIcon className="size-3 shrink-0"/>
			<span className="flex items-baseline gap-1">
          {type}
				{format && (
					<span className="opacity-70 font-normal uppercase tracking-wider text-[10px]">
                ({format})
             </span>
				)}
       </span>
		</Badge>
	)
}