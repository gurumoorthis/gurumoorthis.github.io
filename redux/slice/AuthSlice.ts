// redux/slice/UserSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "@/supabaseClient";

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

// Thunk to fetch users
export const getUserById = createAsyncThunk<
	User,
	string,
	{ rejectValue: string }
>("users/getById", async (userId, { rejectWithValue }) => {
	console.log(userId);
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("id", userId)
		.single(); // Use single() to get one user object instead of array

	if (error) {
		return rejectWithValue(error.message);
	}
	console.log(data);
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
