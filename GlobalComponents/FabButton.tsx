import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface FabButtonProps {
	icon: LucideIcon;
	onClick?: () => void;
	className?: string;
	ariaLabel?: string;
}

export function FabButton({
	icon: Icon,
	onClick,
	className = "",
	ariaLabel = "button",
}: FabButtonProps) {
	return (
		<Button
			onClick={onClick}
			aria-label={ariaLabel}
			className={`rounded-full w-9 h-9 flex items-center justify-center cursor-pointer ${className}`}
		>
			<Icon className="w-5 h-5" />
		</Button>
	);
}
