import type * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"placeholder:text-muted-foreground selection:bg-[var(--color-primary)] selection:text-white dark:bg-input/30 border border-gray-400 flex h-9 w-full min-w-0 rounded-md bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none",
				"focus-visible:border-[var(--color-primary)]",
				"aria-invalid:ring-[var(--color-primary)] aria-invalid:border-[var(--color-primary)]",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
