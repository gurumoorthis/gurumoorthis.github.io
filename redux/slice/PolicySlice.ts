import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";
import { getToastOptions } from "@/utils/getToastOptions";
import type { User } from "./AuthSlice";

export interface UserPolicyProps {
	id: number;
	policies: Policy;
	status: string;
	user_id: string;
}

export interface UserAgentPolicyProps {
	id: number;
	policies: Policy;
	status: string;
}

export interface Policy {
	id: number;
	name: string;
	policy_number: string;
	type: string;
	coverage: number;
	premium: number;
	start_date: Date;
	end_date: Date;
	status: string;
}

interface DashboardState {
	policies: Policy[];
	status: "idle" | "loading" | "success" | "error";
	error: string | null;
	totalPolicyCount: number;
	userPolicies: UserPolicyProps[];
}

const initialState: DashboardState = {
	policies: [],
	userPolicies: [],
	status: "idle",
	error: null,
	totalPolicyCount: 0,
};

type UserPolicy = {
	user_id: string;
	policy_id: number;
	status?: string;
};

export const getPolicies = createAsyncThunk(
	"policy/getPolicies",
	async (_, { rejectWithValue }) => {
		const { data, error } = await supabase
			.from("policies")
			.select("*")
			.order("id", { ascending: true });
		if (error) return rejectWithValue(error.message);
		return {
			data: data as Policy[],
		};
	},
);

export const getUserPolicies = createAsyncThunk(
	"policy/getUserPolicies",
	async (
		{
			user_id,
			page = 1,
			limit = 10,
		}: { user_id: string; page?: number; limit?: number },
		{ rejectWithValue },
	) => {
		const from = (page - 1) * limit;
		const to = from + limit - 1;

		const { data, error, count } = await supabase
			.from("users_policies")
			.select(
				`*,
         policies (*)`,
				{ count: "exact" },
			)
			.eq("user_id", user_id) // 👈 Filter by user ID
			.order("id", { ascending: true })
			.range(from, to);

		if (error) return rejectWithValue(error.message);

		const totalPages = Math.ceil((count ?? 0) / limit);
		return {
			data: data as (UserPolicyProps & { policies: UserPolicyProps[] })[],
			total: totalPages,
		};
	},
);

interface GetPoliciesByAgentArgs {
	agent_id: string;
	page?: number;
	limit?: number;
}

export async function getClientsByAgent(agent_id: string) {
	const { data: agentClients, error: agentClientsError } = await supabase
		.from("agent_clients")
		.select("client_id")
		.eq("agent_id", agent_id);

	if (agentClientsError) throw new Error(agentClientsError.message);

	const clientIds = agentClients?.map((c) => c.client_id) ?? [];
	if (clientIds.length === 0) return [];
	const { data: users, error: usersError } = await supabase
		.from("users")
		.select("*")
		.in("id", clientIds);

	if (usersError) throw new Error(usersError.message);
	return users as User[];
}

export const getPoliciesByAgent = createAsyncThunk(
	"policy/getPoliciesByAgent",
	async (
		{ agent_id, page = 1, limit = 10 }: GetPoliciesByAgentArgs,
		{ rejectWithValue },
	) => {
		const from = (page - 1) * limit;
		const to = from + limit - 1;

		try {
			const clients = await getClientsByAgent(agent_id);
			const clientIds = clients?.map((c) => c.id) ?? [];
			if (clients.length === 0) {
				return { data: [], total: 0 };
			}

			const { data, error, count } = await supabase
				.from("users_policies")
				.select(
					`
          *,
          policies(*)
        `,
					{ count: "exact" },
				)
				.in("user_id", clientIds)
				.order("id", { ascending: true })
				.range(from, to);

			if (error) return rejectWithValue(error.message);

			return {
				data,
				total: Math.ceil((count ?? 0) / limit),
			};
		} catch {
			return rejectWithValue("Failed to fetch policies by agent");
		}
	},
);

export const getPoliciesByAdmin = createAsyncThunk(
	"policy/getPoliciesByAdmin",
	async (
		{ page = 1, limit = 10 }: { page?: number; limit?: number },
		{ rejectWithValue },
	) => {
		const from = (page - 1) * limit;
		const to = from + limit - 1;

		try {
			const { data, error, count } = await supabase
				.from("users_policies")
				.select(
					`
          *,
          policies(*),
          users(*)
        `,
					{ count: "exact" },
				)
				.order("id", { ascending: true })
				.range(from, to);

			if (error) return rejectWithValue(error.message);
			return {
				data,
				total: Math.ceil((count ?? 0) / limit),
			};
		} catch (error: unknown) {
			let errorMessage = "Failed to fetch policies for admin";
			if (error instanceof Error) {
				errorMessage = error.message;
			}
			return rejectWithValue(errorMessage);
		}
	},
);

export const addPolicy = createAsyncThunk(
	"userPolicy/addPolicy",
	async ({ user_id, policy_id }: UserPolicy, { rejectWithValue }) => {
		const { error } = await supabase
			.from("users_policies")
			.insert([{ user_id, policy_id }]);
		if (error) return rejectWithValue(error.message);
		toast.success("Policy created successfully", getToastOptions());
	},
);

export const updatePolicy = createAsyncThunk(
	"userPolicy/updatePolicy",
	async (
		{
			id,
			status,
			user_id,
			policy_id,
		}: { id: number; status: string; user_id: string; policy_id: number },
		{ rejectWithValue },
	) => {
		const { data, error } = await supabase
			.from("users_policies")
			.update({ status, user_id, policy_id })
			.eq("id", id)
			.select();
		if (error) return rejectWithValue(error.message);
		toast.success("Policy updated successfully", getToastOptions());
		return data;
	},
);

export const deletePolicy = createAsyncThunk(
	"userPolicy/deletePolicy",
	async (id: number, { rejectWithValue }) => {
		const { error } = await supabase
			.from("users_policies")
			.delete()
			.eq("id", id);
		if (error) return rejectWithValue(error.message);
		toast.success("Policy deleted successfully", getToastOptions());
	},
);

const dashboardSlice = createSlice({
	name: "policy",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(getPolicies.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getPolicies.fulfilled, (state, action) => {
				state.status = "success";
				state.policies = action.payload?.data ?? [];
			})
			.addCase(getPolicies.rejected, (state, action) => {
				state.status = "error";
				state.error = action.payload as string;
			})
			.addCase(getUserPolicies.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getUserPolicies.fulfilled, (state, action) => {
				state.status = "success";
				state.userPolicies = action.payload?.data ?? [];
				state.totalPolicyCount = action.payload.total ?? 0;
			})
			.addCase(getUserPolicies.rejected, (state, action) => {
				state.status = "error";
				state.error = action.payload as string;
			})
			.addCase(getPoliciesByAgent.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getPoliciesByAgent.fulfilled, (state, action) => {
				state.status = "success";
				state.userPolicies = action.payload?.data ?? [];
				state.totalPolicyCount = action.payload.total ?? 0;
			})
			.addCase(getPoliciesByAgent.rejected, (state, action) => {
				state.status = "error";
				state.error = action.payload as string;
			})
			.addCase(getPoliciesByAdmin.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getPoliciesByAdmin.fulfilled, (state, action) => {
				state.status = "success";
				state.userPolicies = action.payload?.data ?? [];
				state.totalPolicyCount = action.payload.total ?? 0;
			})
			.addCase(getPoliciesByAdmin.rejected, (state, action) => {
				state.status = "error";
				state.error = action.payload as string;
			});
	},
});

export default dashboardSlice.reducer;
