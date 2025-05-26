"use client";

import { useAppDispatch } from "@/redux/hooks";
import {
	getCoverageData,
	getPolicies,
	getPoliciesByTypeStatus,
} from "@/redux/slice/DashboardSlice";
import type { RootState } from "@/redux/store";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
} from "chart.js";
import moment from "moment";
import { useEffect, useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import secureLocalStorage from "react-secure-storage";

ChartJS.register(
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
);

const pieData = {
	labels: ["North", "South", "East", "West"],
	datasets: [
		{
			label: "Policy Count",
			data: [120, 90, 75, 60],
			backgroundColor: ["#60A5FA", "#34D399", "#FBBF24", "#F87171"],
			borderColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
			borderWidth: 1,
		},
	],
};

const barData = {
	labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
	datasets: [
		{
			label: "Life",
			data: [30, 45, 60, 50, 55, 65],
			backgroundColor: "#3B82F6",
		},
		{
			label: "Health",
			data: [25, 35, 40, 45, 50, 55],
			backgroundColor: "#10B981",
		},
		{
			label: "Auto",
			data: [20, 30, 35, 40, 42, 50],
			backgroundColor: "#F59E0B",
		},
	],
};

const lineOptions = {
	responsive: true,
	plugins: {
		legend: {
			position: "top" as const,
		},
	},
	scales: {
		y: {
			beginAtZero: true,
			title: {
				display: true,
				text: "Coverage Amount ($)",
			},
		},
		x: {
			title: {
				display: true,
				text: "Month",
			},
		},
	},
};

const stackedBarOptions = {
	responsive: true,
	plugins: {
		legend: {
			position: "top" as const,
		},
		title: {
			display: false,
		},
	},
	scales: {
		x: {
			stacked: true,
		},
		y: {
			stacked: true,
			title: {
				display: true,
				text: "Number of Policies",
			},
		},
	},
};

interface stackedBarChartDataSetsProps {
	label: string;
	data: number[];
	backgroundColor: string;
}

const statusColors: Record<string, string> = {
	Active: "#4ADE80",
	Lapsed: "#FACC15",
	Cancelled: "#F87171",
};

const types = ["Life", "Health", "Auto"];
const statuses = ["Active", "Lapsed", "Cancelled"];
interface LineChartDataset {
	labels: string[];
	datasets: {
		label: string;
		data: number[];
		borderColor: string;
		backgroundColor: string;
		fill: boolean;
		tension: number;
	}[];
}

export default function Dashboard() {
	const userId = secureLocalStorage.getItem("user_id") as string;
	const { policyCountsByTypeStatus, coverageData } = useSelector(
		(state: RootState) => state.DASHBOARD,
	);
	const dispatch = useAppDispatch();
	const [stackedBarChartData, setStackedBarChartData] = useState<{
		labels: string[];
		datasets: stackedBarChartDataSetsProps[];
	}>({
		labels: types,
		datasets: [],
	});
	const [lineData, setLineData] = useState<LineChartDataset>({
		labels: [],
		datasets: [
			{
				label: "Total Coverage ($)",
				data: [],
				borderColor: "#3B82F6",
				backgroundColor: "rgba(59, 130, 246, 0.3)",
				fill: true,
				tension: 0.4,
			},
		],
	});

	useEffect(() => {
		if (userId) {
			dispatch(getPolicies(userId));
			dispatch(getPoliciesByTypeStatus(userId));
			dispatch(getCoverageData(userId));
		}
	}, [dispatch, userId]);

	useEffect(() => {
		const datasets = statuses.map((status) => ({
			label: status,
			data: types.map((type) => {
				const match = policyCountsByTypeStatus.find(
					(item) => item.type === type && item.status === status,
				);
				return match ? match.count : 0;
			}),
			backgroundColor: statusColors[status],
		}));

		setStackedBarChartData({
			labels: types,
			datasets,
		});
	}, [policyCountsByTypeStatus]);

	useEffect(() => {
		if (Object.keys(coverageData).length > 0) {
			setLineData({
				labels: coverageData.map((item: { month: string }) =>
					moment(item.month).format("MMM"),
				),
				datasets: [
					{
						label: "Total Coverage ($)",
						data: coverageData.map(
							(item: { total_coverage: number }) => item.total_coverage,
						),
						borderColor: "#3B82F6",
						backgroundColor: "rgba(59, 130, 246, 0.3)",
						fill: true,
						tension: 0.4,
					},
				],
			});
		}
	}, [coverageData]);

	return (
		<div>
			<h1 className="text-2xl font-bold mb-6">Dashboard</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="bg-white p-4 rounded-2xl shadow">
					<h2 className="text-lg font-semibold mb-2">
						Policy Distribution by Region
					</h2>
					<Pie data={pieData} />
				</div>
				<div className="bg-white p-4 rounded-2xl shadow">
					<h2 className="text-lg font-semibold mb-2">
						Monthly New Policies by Category
					</h2>
					<Bar data={barData} />
				</div>
				<div className="bg-white p-4 rounded-2xl shadow">
					<h2 className="text-lg font-semibold mb-2">
						Total Coverage Amount Over Time
					</h2>
					<Line data={lineData} options={lineOptions} />
				</div>
				<div className="bg-white p-4 rounded-2xl shadow">
					<h2 className="text-lg font-semibold mb-2">
						Policy Count by Type and Status
					</h2>
					<Bar data={stackedBarChartData} options={stackedBarOptions} />
				</div>
			</div>
		</div>
	);
}
