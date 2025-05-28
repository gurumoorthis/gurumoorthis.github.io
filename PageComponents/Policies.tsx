"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { useAppDispatch } from "@/redux/hooks";
import {
	addPolicy,
	getPolicies,
	getUserPolicies,
	updatePolicy,
	type UserPolicyProps,
	type Policy,
	deletePolicy,
	getPoliciesByAgent,
	getPoliciesByAdmin,
	getClientsByAgent,
} from "@/redux/slice/PolicySlice";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Pencil, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import moment from "moment";
import { FabButton } from "@/GlobalComponents/FabButton";
import TableSkeletonLoader from "@/GlobalComponents/TableSkeletonLoader";
import PageTitle from "@/GlobalComponents/PageTitle";
import { getToastOptions } from "@/utils/getToastOptions";
import { toast } from "sonner";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useAppContext } from "@/app/context/AppContext";
import { Role } from "@/enums";
import { getAllUsers, type User } from "@/redux/slice/AuthSlice";

export default function Policies() {
	const userId = secureLocalStorage.getItem("user_id") as string;
	const dispatch = useAppDispatch();
	const { policies, totalPolicyCount, userPolicies } = useSelector(
		(state: RootState) => state.POLICY,
	);
	const { userDetails, userList } = useSelector(
		(state: RootState) => state.AUTH,
	);
	const { setLoading } = useAppContext();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [formState, setFormState] = useState<Partial<Policy>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [isEdit, setIsEdit] = useState(false);
	const [fetchData, setFetchData] = useState(true);
	const [open, setOpen] = useState(false);
	const [activePolicy, setActivePolicy] = useState(0);
	const [agentClients, setAgentClients] = useState<User[]>([]);
	const [clientUserId, setClientUserId] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setLoading(true);
			if (isEdit) {
				await dispatch(
					updatePolicy({
						id: activePolicy,
						status: formState.status ?? "",
						user_id: clientUserId,
						policy_id: formState.id ?? 0,
					}),
				).unwrap();
				setActivePolicy(0);
			} else {
				await dispatch(
					addPolicy({
						user_id: clientUserId,
						policy_id: formState.id ?? 0,
					}),
				).unwrap();
			}
			setFetchData(true);
			setIsDialogOpen(false);
			setFormState({});
			setClientUserId("");
		} catch (error) {
			console.error("Failed to save user policy:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAdd = () => {
		setFormState({});
		setIsDialogOpen(true);
		setIsEdit(false);
		setClientUserId(userId);
	};

	const handleEdit = (policy: UserPolicyProps) => {
		setFormState({ ...policy.policies, status: policy.status });
		setIsDialogOpen(true);
		setIsEdit(true);
		setActivePolicy(policy.id);
		setClientUserId(policy.user_id);
	};

	const handleOpenDelete = (policy: UserPolicyProps) => {
		setFormState({ ...policy.policies, status: policy.status });
		setOpen(true);
		setActivePolicy(policy.id);
	};

	const handleDelete = () => {
		setLoading(true);
		dispatch(deletePolicy(activePolicy))
			.unwrap()
			.then(() => {
				setFetchData(true);
				setOpen(false);
				setActivePolicy(0);
			})
			.catch(() => {
				toast.error("Failed to delete policy", getToastOptions());
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		if (userId && fetchData) {
			const fetchData = async () => {
				setIsLoading(true);
				setFetchData(false);
				if (userDetails.roles?.name === Role.POLICY_HOLDER) {
					await dispatch(
						getUserPolicies({ user_id: userId, page: currentPage, limit: 10 }),
					);
				} else if (userDetails.roles?.name === Role.AGENT) {
					await dispatch(
						getPoliciesByAgent({
							agent_id: userId,
							page: currentPage,
							limit: 10,
						}),
					);
				} else {
					dispatch(
						getPoliciesByAdmin({
							page: currentPage,
							limit: 10,
						}),
					);
				}
				setIsLoading(false);
			};
			fetchData();
		}
	}, [dispatch, userId, currentPage, fetchData, userDetails.roles?.name]);

	useEffect(() => {
		if (userId) {
			const fetchData = async () => {
				await dispatch(getAllUsers());
			};
			fetchData();
		}
	}, [dispatch, userId]);

	useEffect(() => {
		if (userList) {
			setAgentClients(userList);
		}
	}, [userList]);

	useEffect(() => {
		if (userId) {
			const fetchData = async () => {
				setIsLoading(true);
				await dispatch(getPolicies());
				if (userDetails.roles.name === Role.AGENT) {
					const clients = await getClientsByAgent(userId);
					setAgentClients(clients);
				}
				setIsLoading(false);
			};
			fetchData();
		}
	}, [dispatch, userId, userDetails.roles.name]);

	const goToPage = (page: number) => {
		if (page > 0 && page <= totalPolicyCount) {
			setCurrentPage(page);
		}
	};

	const handleSelectPolicy = (value: string) => {
		const selectedPolicy = policies.find(
			(policy) => policy.id === Number(value),
		);
		setFormState({ ...formState, ...selectedPolicy });
	};
	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<PageTitle title="Policies" />
				{userDetails.roles?.name !== Role.POLICY_HOLDER && (
					<Button onClick={handleAdd} className="btn-primary">
						Add Policy
					</Button>
				)}
			</div>
			{isLoading ? (
				<TableSkeletonLoader rows={15} columns={5} />
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="font-bold text-gray-500">S.No</TableHead>
							<TableHead className="text-center text-gray-500 font-bold">
								Name
							</TableHead>
							<TableHead className="text-center text-gray-500 font-bold">
								Number
							</TableHead>
							<TableHead className="text-center text-gray-500 font-bold">
								Type
							</TableHead>
							<TableHead className="text-center text-gray-500 font-bold">
								Status
							</TableHead>
							<TableHead className="text-center text-gray-500 font-bold">
								Coverage
							</TableHead>
							<TableHead className="text-center text-gray-500 font-bold">
								Premium
							</TableHead>
							<TableHead className="text-center text-gray-500 font-bold">
								Duration
							</TableHead>
							<TableHead className="text-center text-gray-500 font-bold">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{userPolicies.map((policy, index) => (
							<TableRow key={policy.id}>
								<TableCell>{index + 1}</TableCell>
								<TableCell align="center">{policy.policies?.name}</TableCell>
								<TableCell align="center">
									{policy.policies.policy_number}
								</TableCell>
								<TableCell align="center">{policy.policies?.type}</TableCell>
								<TableCell align="center">{policy.status}</TableCell>
								<TableCell align="center">
									${policy.policies?.coverage}
								</TableCell>
								<TableCell align="center">
									${policy.policies?.premium}
								</TableCell>
								<TableCell align="center">{`${moment(policy.policies?.start_date).format("MMM yyyy")} - ${moment(policy.policies?.end_date).format("MMM yyyy")}`}</TableCell>
								<TableCell align="center">
									<div className="flex gap-2 justify-center">
										<FabButton
											icon={Pencil}
											ariaLabel="Edit"
											className="bg-orange-500 hover:bg-orange-600 text-white"
											onClick={() => handleEdit(policy)}
										/>
										{userDetails.roles?.name === Role.ADMIN && (
											<FabButton
												icon={Trash2}
												ariaLabel="Delete"
												className="bg-red-500 hover:bg-red-600 text-white"
												onClick={() => handleOpenDelete(policy)}
											/>
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableCell colSpan={9}>
								{userPolicies.length === 0 ? (
									<h4 className="text-center font-bold text-xl">
										No data found
									</h4>
								) : (
									<Pagination>
										<PaginationContent>
											<PaginationItem>
												<PaginationPrevious
													href="#"
													onClick={(e) => {
														e.preventDefault();
														goToPage(currentPage - 1);
													}}
												/>
											</PaginationItem>
											{[...Array(totalPolicyCount)].map((_, index) => {
												const page = index + 1;
												return (
													<PaginationItem key={page}>
														<PaginationLink
															href="#"
															isActive={page === currentPage}
															onClick={(e) => {
																e.preventDefault();
																goToPage(page);
															}}
														>
															{page}
														</PaginationLink>
													</PaginationItem>
												);
											})}
											<PaginationItem>
												<PaginationEllipsis />
											</PaginationItem>
											<PaginationItem>
												<PaginationNext
													href="#"
													onClick={(e) => {
														e.preventDefault();
														goToPage(currentPage + 1);
													}}
												/>
											</PaginationItem>
										</PaginationContent>
									</Pagination>
								)}
							</TableCell>
						</TableRow>
					</TableFooter>
				</Table>
			)}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<form onSubmit={handleSubmit} className="space-y-6 py-2">
						<DialogHeader>
							<DialogTitle>
								{isEdit ? "Update Policy" : "Add Policy"}
							</DialogTitle>
						</DialogHeader>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label>Name</Label>
								<Select
									required
									value={formState.id?.toString()}
									onValueChange={handleSelectPolicy}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select policy name" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{policies.map((option) => (
												<SelectItem key={option.name} value={String(option.id)}>
													{option.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
							{userDetails.roles?.name !== Role.POLICY_HOLDER && (
								<div className="space-y-2">
									<Label>Policyholder</Label>
									<Select
										required
										value={clientUserId}
										onValueChange={(value) => setClientUserId(value)}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select policyholder" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{agentClients.map((option) => (
													<SelectItem
														key={option.name}
														value={String(option.id)}
													>
														{option.name}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>
							)}
							<div className="space-y-2">
								<Label>Number</Label>
								<Input disabled value={formState.policy_number || ""} />
							</div>
							<div className="space-y-2">
								<Label>Type</Label>
								<Input disabled value={formState.type || ""} />
							</div>
							<div className="space-y-2">
								<Label>Duration</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											id="date"
											variant={"outline"}
											className="w-full"
											disabled
										>
											<CalendarIcon />
											{formState.start_date ? (
												formState.end_date ? (
													<>
														{moment(formState.start_date).format("DD/MM/YYYY")}{" "}
														- {moment(formState.end_date).format("DD/MM/YYYY")}
													</>
												) : (
													moment(formState.start_date).format("DD/MM/YYYY")
												)
											) : (
												<span>Pick a date</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="range"
											defaultMonth={formState?.start_date}
											selected={{
												from: formState.start_date,
												to: formState.end_date,
											}}
											numberOfMonths={2}
										/>
									</PopoverContent>
								</Popover>
							</div>
							<div className="space-y-2">
								<Label>Coverage</Label>
								<Input disabled value={formState.coverage || ""} />
							</div>
							<div className="space-y-2">
								<Label>Premium</Label>
								<Input disabled value={formState.premium || ""} />
							</div>
						</div>
						{isEdit && (
							<div className="space-y-2">
								<Label>Status</Label>
								<Select
									required
									value={formState.status ?? ""}
									onValueChange={(value) =>
										setFormState((prev) => ({ ...prev, status: value }))
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select policy status" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="active">Active</SelectItem>
											<SelectItem value="lapsed">Lapsed</SelectItem>
											<SelectItem value="cancelled">Cancelled</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
						)}
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" className="btn-primary">
								Submit
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Policy</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this policy?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button className="btn-primary" onClick={handleDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
