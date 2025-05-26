import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "@/supabaseClient";
import secureLocalStorage from "react-secure-storage";

interface User {
	id: string;
	email: string;
	role: string;
}

interface UserState {
	userDetails: User;
	status: "idle" | "loading" | "success" | "error";
	error: string | null;
}

const initialState: UserState = {
	userDetails: { role: "", email: "", id: "" },
	status: "idle",
	error: null,
};

export const getUserById = createAsyncThunk<
	User,
	string,
	{ rejectValue: string }
>("users/getById", async (userId, { rejectWithValue }) => {
	const { data, error } = await supabase
		.from("users")
		.select(`
    *,
    roles (*)
  `)
		.eq("id", userId)
		.single();

	if (error) {
		return rejectWithValue(error.message);
	}
	secureLocalStorage.setItem("userRole", data?.roles?.name);
	return data as User;
});

const authSlice = createSlice({
	name: "user",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(getUserById.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getUserById.fulfilled, (state, action) => {
				state.status = "success";
				state.userDetails = action.payload;
			})
			.addCase(getUserById.rejected, (state, action) => {
				state.status = "error";
				state.error = action.payload as string;
			});
	},
});

export default authSlice.reducer;
