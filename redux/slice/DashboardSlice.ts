import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "@/supabaseClient";

interface PolicyCountByTypeStatus {
	type: string;
	status: string;
	count: number;
}

interface DashboardState {
	status: "idle" | "loading" | "success" | "error";
	error: string | null;
	policyCountsByTypeStatus: PolicyCountByTypeStatus[];
	coverageData: { month: string; total_coverage: number }[];
	coverageTypeData: { month: string; type: string; total_coverage: number }[];
	premiumByType: { type: string; total_premium: number }[];
}

const initialState: DashboardState = {
	status: "idle",
	error: null,
	policyCountsByTypeStatus: [],
	coverageData: [],
	coverageTypeData: [],
	premiumByType: [],
};

export const getPoliciesByTypeStatusByUser = createAsyncThunk<
	{ type: string; status: string; count: number }[],
	string,
	{ rejectValue: string }
>(
	"dashboard/getPoliciesByTypeStatusByUser",
	async (p_user_id, { rejectWithValue }) => {
		const { data, error } = await supabase.rpc(
			"get_policy_counts_by_type_status",
			{ p_user_id },
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

export const getCoverageByType = createAsyncThunk(
	"dashboard/getCoverageByType",
	async (user_id: string, { rejectWithValue }) => {
		const { data, error } = await supabase.rpc("get_monthly_coverage_by_type", {
			p_user_id: user_id,
		});

		if (error) return rejectWithValue(error.message);
		return data as { month: string; type: string; total_coverage: number }[];
	},
);

export const getPremiumSumByType = createAsyncThunk<
	{ type: string; total_premium: number }[],
	void,
	{ rejectValue: string }
>("policy/getPremiumSumByType", async (_, { rejectWithValue }) => {
	const { data, error } = await supabase.rpc("get_premium_sum_by_type");

	if (error) return rejectWithValue(error.message);

	return data as { type: string; total_premium: number }[];
});

const dashboardSlice = createSlice({
	name: "dashboard",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(getPoliciesByTypeStatusByUser.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getPoliciesByTypeStatusByUser.fulfilled, (state, action) => {
				state.status = "success";
				state.policyCountsByTypeStatus = action.payload;
			})
			.addCase(getPoliciesByTypeStatusByUser.rejected, (state, action) => {
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
			})
			.addCase(getCoverageByType.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getCoverageByType.fulfilled, (state, action) => {
				state.status = "success";
				state.coverageTypeData = action.payload;
			})
			.addCase(getCoverageByType.rejected, (state, action) => {
				state.status = "error";
				state.error = action.payload as string;
			})
			.addCase(getPremiumSumByType.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getPremiumSumByType.fulfilled, (state, action) => {
				state.status = "success";
				state.premiumByType = action.payload;
			})
			.addCase(getPremiumSumByType.rejected, (state, action) => {
				state.status = "error";
				state.error = action.payload as string;
			});
	},
});

export default dashboardSlice.reducer;
