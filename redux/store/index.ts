import {
	configureStore,
	combineReducers,
	type AnyAction,
} from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import AuthReducer from "@/redux/slice/AuthSlice";
import DashboardReducer from "@/redux/slice/DashboardSlice";

const persistConfig = {
	key: "root",
	version: 1,
	storage,
};

const appReducer = combineReducers({
	AUTH: AuthReducer,
	DASHBOARD: DashboardReducer,
});

const rootReducer = (
	state: ReturnType<typeof appReducer> | undefined,
	action: AnyAction,
) => {
	if (action.type === "RESET_APP") {
		return appReducer(undefined, { type: "@@INIT" });
	}
	return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false, // disable serializable check for redux-persist
		}),
});

// Types for TypeScript usage throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
