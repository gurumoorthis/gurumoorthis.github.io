import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "@/supabaseClient";
import secureLocalStorage from "react-secure-storage";
import type { Role } from "@/utils/types";

export interface User {
	id: string;
	name: string;
	email: string;
	password: string;
	phone: string;
	created_at: Date;
	roles: { name: Role; id: string };
	role_id: string;
}

export interface RoleProps {
	id: string;
	name: "policy_holder" | "admin" | "agent";
}

interface UserState {
	userDetails: User;
	status: "idle" | "loading" | "success" | "error";
	error: string | null;
	roles: RoleProps[];
}

const initialState: UserState = {
	userDetails: {
		roles: { name: "policy_holder", id: "" },
		email: "",
		id: "",
		name: "",
		phone: "",
		password: "",
		created_at: new Date(),
		role_id: "",
	},
	status: "idle",
	error: null,
	roles: [],
};

export const getAllRoles = createAsyncThunk<
	RoleProps[],
	void,
	{ rejectValue: string }
>("roles/getAll", async (_, { rejectWithValue }) => {
	const { data, error } = await supabase.from("roles").select("*");

	if (error) {
		return rejectWithValue(error.message);
	}

	return data as RoleProps[];
});

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
	document.cookie = `role=${data?.roles?.name}; Path=/; SameSite=Strict;`;
	return data as User;
});

export const getAllUsers = createAsyncThunk<
	User[],
	string | undefined,
	{ rejectValue: string }
>("users/getAll", async (roleName, { rejectWithValue }) => {
	let query = supabase.from("users").select(`
		*,
		roles (*)
	`);

	if (roleName) {
		query = query.eq("roles.name", roleName);
	}
	const { data, error } = await query;
	if (error) {
		return rejectWithValue(error.message);
	}
	return data as User[];
});

export const addUser = createAsyncThunk<
	User,
	Partial<User>,
	{ rejectValue: string }
>("users/add", async (newUser, { rejectWithValue }) => {
	const { data, error } = await supabase
		.from("users")
		.insert([newUser])
		.select("*, roles (*)")
		.single();

	if (error) {
		return rejectWithValue(error.message);
	}
	return data as User;
});

export const updateUser = createAsyncThunk<
	User,
	{ id: string; updates: Partial<User> },
	{ rejectValue: string }
>("users/update", async ({ id, updates }, { rejectWithValue }) => {
	const { data, error } = await supabase
		.from("users")
		.update(updates)
		.eq("id", id)
		.select("*, roles (*)")
		.single();

	if (error) {
		return rejectWithValue(error.message);
	}
	return data as User;
});

export const deleteUser = createAsyncThunk<
	string,
	string,
	{ rejectValue: string }
>("users/delete", async (id, { rejectWithValue }) => {
	const { error } = await supabase.from("users").delete().eq("id", id);
	if (error) {
		return rejectWithValue(error.message);
	}
	return id;
});

const authSlice = createSlice({
	name: "user",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(getAllRoles.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getAllRoles.fulfilled, (state, action) => {
				state.status = "success";
				state.roles = action.payload;
			})
			.addCase(getAllRoles.rejected, (state, action) => {
				state.status = "error";
				state.error = action.payload as string;
			})
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
