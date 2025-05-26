import {
	createAsyncThunk,
	createSlice,
	type PayloadAction,
} from "@reduxjs/toolkit";
import { supabase } from "@/supabaseClient";

export interface Policy {
	id: string;
	policy_number: string;
	type: string;
	coverage: number;
	premium: number;
	start_date: string;
	end_date: string;
	status: string;
	user_id: string;
}

interface PolicyCountByTypeStatus {
	type: string;
	status: string;
	count: number;
}

interface DashboardState {
	policies: Policy[];
	filteredPolicies: Policy[];
	status: "idle" | "loading" | "success" | "error";
	error: string | null;
	policyCountsByTypeStatus: PolicyCountByTypeStatus[];
	filters: {
		type?: string;
		status?: string;
		startDate?: string;
		endDate?: string;
	};
	coverageData: { month: string; total_coverage: number }[];
}

const initialState: DashboardState = {
	policies: [],
	filteredPolicies: [],
	status: "idle",
	error: null,
	filters: {},
	policyCountsByTypeStatus: [],
	coverageData: [],
};

export const getPolicies = createAsyncThunk(
	"dashboard/getPolicies",
	async (user_id: string, { rejectWithValue }) => {
		const { data, error } = await supabase
			.from("policies")
			.select("*")
			.eq("user_id", user_id);

		if (error) return rejectWithValue(error.message);
		return data as Policy[];
	},
);

export const getPoliciesByTypeStatus = createAsyncThunk(
	"dashboard/getPoliciesByTypeStatus",
	async (user_id: string, { rejectWithValue }) => {
		const { data, error } = await supabase.rpc(
			"get_policy_counts_by_type_status",
			{
				p_user_id: user_id,
			},
		);

		if (error) return rejectWithValue(error.message);
		return data as { type: string; status: string; count: number }[];
	},
);

export const getCoverageData = createAsyncThunk(
	"dashboard/getCoverageData",
	async (user_id: string, { rejectWithValue }) => {
		const { data, error } = await supabase.rpc("get_monthly_coverage", {
			p_user_id: user_id,
		});

		if (error) return rejectWithValue(error.message);
		return data as { month: string; total_coverage: number }[];
	},
);

const dashboardSlice = createSlice({
	name: "dashboard",
	initialState,
	reducers: {
		setFilters(state, action: PayloadAction<DashboardState["filters"]>) {
			state.filters = action.payload;
			state.filteredPolicies = state.policies.filter((policy) => {
				const { type, status, startDate, endDate } = state.filters;
				if (type && policy.type !== type) return false;
				if (status && policy.status !== status) return false;
				if (startDate && new Date(policy.start_date) < new Date(startDate))
					return false;
				if (endDate && new Date(policy.end_date) > new Date(endDate))
					return false;
				return true;
			});
		},
		addPolicy(state, action: PayloadAction<Policy>) {
			state.policies.push(action.payload);
			state.filteredPolicies = state.policies.filter((policy) => {
				const { type, status, startDate, endDate } = state.filters;
				if (type && policy.type !== type) return false;
				if (status && policy.status !== status) return false;
				if (startDate && new Date(policy.start_date) < new Date(startDate))
					return false;
				if (endDate && new Date(policy.end_date) > new Date(endDate))
					return false;
				return true;
			});
		},
		updatePolicy(state, action: PayloadAction<Policy>) {
			const index = state.policies.findIndex((p) => p.id === action.payload.id);
			if (index !== -1) {
				state.policies[index] = action.payload;
			}
			state.filteredPolicies = state.policies.filter((policy) => {
				const { type, status, startDate, endDate } = state.filters;
				if (type && policy.type !== type) return false;
				if (status && policy.status !== status) return false;
				if (startDate && new Date(policy.start_date) < new Date(startDate))
					return false;
				if (endDate && new Date(policy.end_date) > new Date(endDate))
					return false;
				return true;
			});
		},
		removePolicy(state, action: PayloadAction<string>) {
			state.policies = state.policies.filter((p) => p.id !== action.payload);
			state.filteredPolicies = state.filteredPolicies.filter(
				(p) => p.id !== action.payload,
			);
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getPolicies.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getPolicies.fulfilled, (state, action) => {
				state.status = "success";
				state.policies = action.payload;
				state.filteredPolicies = action.payload;
			})
			.addCase(getPolicies.rejected, (state, action) => {
				state.status = "error";
				state.error = action.payload as string;
			})
			.addCase(getPoliciesByTypeStatus.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getPoliciesByTypeStatus.fulfilled, (state, action) => {
				state.status = "success";
				state.policyCountsByTypeStatus = action.payload;
			})
			.addCase(getPoliciesByTypeStatus.rejected, (state, action) => {
				state.status = "error";
				state.error = action.payload as string;
			})
			.addCase(getCoverageData.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getCoverageData.fulfilled, (state, action) => {
				state.status = "success";
				state.coverageData = action.payload;
			})
			.addCase(getCoverageData.rejected, (state, action) => {
				state.status = "error";
				state.error = action.payload as string;
			});
	},
});

export const { setFilters, addPolicy, updatePolicy, removePolicy } =
	dashboardSlice.actions;
export default dashboardSlice.reducer;
