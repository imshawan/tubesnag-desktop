"use client";

import * as React from "react";
import {cn} from "@/lib/utils/tailwind";
import {useTranslation} from "react-i18next";

interface DeleteWithFilesOptionProps {
	initialValue?: boolean;
	onValueChange?: (value: boolean) => void;
}

export function DeleteWithFilesOption({
	                                      initialValue = false,
	                                      onValueChange,
                                      }: Readonly<DeleteWithFilesOptionProps>) {
	const {t} = useTranslation();
	const [checked, setChecked] = React.useState(initialValue);

	React.useEffect(() => {
		onValueChange?.(checked);
	}, [checked, onValueChange]);

	return (
		<div
			className={cn(
				"flex items-center p-2 cursor-pointer transition-colors select-none",
			)}
			onClick={() => setChecked(!checked)}
		>
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => setChecked(e.target.checked)}
				className="w-5 h-5"
			/>
			<span className="ml-3 text-sm text-gray-700 dark:text-gray-200">
        {t("common.deleteWithFiles")}
      </span>
		</div>
	);
}