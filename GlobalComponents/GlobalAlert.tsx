import { Alert, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlertType } from "./types";

interface AlertData {
	alert: { type: AlertType; message: string };
	setAlert: React.Dispatch<
		React.SetStateAction<{
			type: AlertType;
			message: string;
		}>
	>;
}

export default function GlobalAlert({ alert, setAlert }: AlertData) {
	if (!alert.type || !alert.message) return null;

	const isSuccess = alert.type === "success";
	const Icon = isSuccess ? CheckCircle2 : AlertCircle;

	return (
		<div className="fixed bottom-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
			<Alert
				variant={isSuccess ? "default" : "destructive"}
				className={cn("shadow-md flex items-start gap-3")}
			>
				<div className="flex gap-3">
					<Icon className="h-5 w-5" />
					<AlertTitle>{alert.message}</AlertTitle>
				</div>
				<div className="flex-1 flex justify-end">
					<X size={20} onClick={() => setAlert({ type: null, message: "" })} />
				</div>
			</Alert>
		</div>
	);
}
