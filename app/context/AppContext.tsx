"use client";
import GlobalAlert from "@/GlobalComponents/GlobalAlert";
import type { AlertType } from "@/GlobalComponents/types";
import type React from "react";
import { createContext, useContext, useState } from "react";

interface AppContextProps {
	loading: boolean;
	setLoading: (value: boolean) => void;
	alert: { type: "success" | "error" | null; message: string };
	setAlert: React.Dispatch<
		React.SetStateAction<{
			type: AlertType;
			message: string;
		}>
	>;
}

const defaultContext: AppContextProps = {
	loading: false,
	setLoading: () => {},
	alert: { type: null, message: "" },
	setAlert: () => {},
};

const AppContext = createContext<AppContextProps>(defaultContext);
const useAppContext = () => useContext(AppContext);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [loading, setLoading] = useState(false);
	const [alert, setAlert] = useState<{ type: AlertType; message: string }>({
		type: null,
		message: "",
	});

	return (
		<AppContext.Provider value={{ loading, setLoading, alert, setAlert }}>
			{children}
			<GlobalAlert alert={alert} setAlert={setAlert} />
		</AppContext.Provider>
	);
};

export { AppProvider, useAppContext };
