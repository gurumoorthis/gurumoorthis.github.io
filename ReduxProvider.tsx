"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import type { ReactNode } from "react";
import { store } from "./redux/store";

const persistor = persistStore(store);

export default function ReduxProvider({ children }: { children: ReactNode }) {
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				{children}
			</PersistGate>
		</Provider>
	);
}
