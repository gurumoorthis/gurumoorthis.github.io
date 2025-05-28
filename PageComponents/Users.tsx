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
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Check, ChevronsUpDown, Pencil, Trash2 } from "lucide-react";
import moment from "moment";
import { FabButton } from "@/GlobalComponents/FabButton";
import TableSkeletonLoader from "@/GlobalComponents/TableSkeletonLoader";
import PageTitle from "@/GlobalComponents/PageTitle";
import { getToastOptions } from "@/utils/getToastOptions";
import { toast } from "sonner";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useAppContext } from "@/app/context/AppContext";
import { Role } from "@/enums";
import {
	deleteUser,
	getAllRoles,
	getAllUsers,
	type User,
} from "@/redux/slice/AuthSlice";
import { toTitleCase } from "@/utils/toTileCase";
import { supabase } from "@/supabaseClient";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function Users() {
	const userId = secureLocalStorage.getItem("user_id") as string;
	const dispatch = useAppDispatch();
	const { totalPolicyCount, userPolicies } = useSelector(
		(state: RootState) => state.POLICY,
	);
	const { roles, userDetails } = useSelector((state: RootState) => state.AUTH);
	const { setLoading } = useAppContext();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [formState, setFormState] = useState<Partial<User>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [isEdit, setIsEdit] = useState(false);
	const [fetchData, setFetchData] = useState(true);
	const [open, setOpen] = useState(false);
	const [userList, setUserList] = useState<User[]>([]);
	const [policyHolderUserList, setPolicyHolderUserList] = useState<User[]>([]);
	const [openPolicyUser, setOpenPolicyUser] = useState(false);
	const [values, setValues] = useState<string[]>([]);

	const toggleValue = (val: string) => {
		if (values.includes(val)) {
			setValues(values.filter((v) => v !== val));
		} else {
			setValues([...values, val]);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			if (isEdit) {
				const { error: updateError } = await supabase
					.from("users")
					.update({
						name: formState.name,
						email: formState.email,
						phone: formState.phone,
						password: formState.password,
						role_id: formState.role_id,
					})
					.eq("id", formState.id);
				if (updateError) {
					toast.error(updateError.message, getToastOptions());
					setLoading(false);
					return;
				}
				toast.success("User updated successfully!", getToastOptions());
			} else {
				const signUpRes = await supabase.auth.signUp({
					email: formState.email ?? "",
					password: formState.password ?? "",
				});

				if (signUpRes.error || !signUpRes.data.user) {
					toast.error(
						signUpRes.error?.message || "Error creating user account.",
						getToastOptions(),
					);
					setLoading(false);
					return;
				}
				const userId = signUpRes.data?.user?.id;
				const { error: insertError } = await supabase.from("users").insert([
					{
						id: userId,
						name: formState.name,
						email: formState.email,
						phone: formState.phone,
						password: formState.password,
						role_id: formState.role_id,
					},
				]);
				if (insertError) {
					toast.error(insertError.message, getToastOptions());
					setLoading(false);
					return;
				}
				toast.success("User created successfully!", getToastOptions());
			}
			setIsDialogOpen(false);
			setFormState({});
			setFetchData(true);
		} catch (err) {
			toast.error(`Unexpected error: ${err}`, getToastOptions());
		} finally {
			setLoading(false);
		}
	};

	const handleAdd = () => {
		setFormState({});
		setIsDialogOpen(true);
		setIsEdit(false);
	};

	const handleEdit = (user: User) => {
		setFormState({
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone,
			password: user.password,
			role_id: user.roles.id,
		});
		setIsEdit(true);
		setIsDialogOpen(true);
	};

	const handleOpenDelete = (user: User) => {
		setFormState(user);
		setOpen(true);
	};

	const handleDelete = () => {
		setLoading(true);
		dispatch(deleteUser(formState.id ?? ""))
			.unwrap()
			.then(() => {
				setFetchData(true);
				setOpen(false);
				setFormState({});
			})
			.catch(() => {
				toast.error("Failed to delete user", getToastOptions());
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		if (userId && fetchData) {
			const loadData = async () => {
				setIsLoading(true);
				try {
					const users = await dispatch(getAllUsers()).unwrap();
					setUserList(users);
				} catch (error) {
					console.error("Failed to fetch users:", error);
				} finally {
					setIsLoading(false);
					setFetchData(false);
				}
			};
			loadData();
		}
	}, [dispatch, userId, fetchData]);

	useEffect(() => {
		if (userId) {
			const fetchData = async () => {
				await dispatch(getAllRoles());
				try {
					const users = await dispatch(
						getAllUsers(Role.POLICY_HOLDER),
					).unwrap();
					setPolicyHolderUserList(users);
				} catch (error) {
					console.error("Failed to fetch users:", error);
				}
			};
			fetchData();
		}
	}, [dispatch, userId]);

	const goToPage = (page: number) => {
		if (page > 0 && page <= totalPolicyCount) {
			setCurrentPage(page);
		}
	};

	useEffect(() => {
		if (roles.length > 0) {
			const defaultRole = roles.find(
				(role) => role.name === Role.POLICY_HOLDER,
			);
			setFormState((prev) => ({ ...prev, role_id: defaultRole?.id }));
		}
	}, [roles]);

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<PageTitle title="Users" />
				{userDetails.roles?.name !== Role.POLICY_HOLDER && (
					<Button onClick={handleAdd} className="btn-primary">
						Add User
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
								Email
							</TableHead>
							<TableHead className="text-center text-gray-500 font-bold">
								Phone
							</TableHead>
							<TableHead className="text-center text-gray-500 font-bold">
								Password
							</TableHead>
							<TableHead className="text-center text-gray-500 font-bold">
								Role
							</TableHead>
							<TableHead className="text-center text-gray-500 font-bold">
								Created Date
							</TableHead>
							<TableHead className="text-center text-gray-500 font-bold">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{userList.map((user, index) => (
							<TableRow key={user.id}>
								<TableCell>{index + 1}</TableCell>
								<TableCell align="center">{user.name}</TableCell>
								<TableCell align="center">{user.email}</TableCell>
								<TableCell align="center">{user.phone}</TableCell>
								<TableCell align="center">{user.password}</TableCell>
								<TableCell align="center">
									{toTitleCase(user.roles?.name ?? "")}
								</TableCell>
								<TableCell align="center">
									{moment(user.created_at).format("DD MMM yyyy")}
								</TableCell>
								<TableCell align="center">
									<div className="flex gap-2 justify-center">
										<FabButton
											icon={Pencil}
											ariaLabel="Edit"
											className="bg-orange-500 hover:bg-orange-600 text-white"
											onClick={() => handleEdit(user)}
										/>
										{userDetails.roles?.name === Role.ADMIN && (
											<FabButton
												icon={Trash2}
												ariaLabel="Delete"
												className="bg-red-500 hover:bg-red-600 text-white"
												onClick={() => handleOpenDelete(user)}
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
							<DialogTitle>{isEdit ? "Update User" : "Add User"}</DialogTitle>
						</DialogHeader>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label>Name</Label>
								<Input
									required
									value={formState.name ?? ""}
									onChange={(e) =>
										setFormState({
											...formState,
											name: e.target.value.trimStart(),
										})
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Email</Label>
								<Input
									required
									type="email"
									value={formState.email ?? ""}
									onChange={(e) =>
										setFormState({ ...formState, email: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Phone</Label>
								<Input
									required
									maxLength={10}
									minLength={10}
									value={formState.phone ?? ""}
									onChange={(e) =>
										setFormState({
											...formState,
											phone: e.target.value.trimStart(),
										})
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Password</Label>
								<Input
									required
									value={formState.password ?? ""}
									onChange={(e) =>
										setFormState({ ...formState, password: e.target.value })
									}
									maxLength={6}
									minLength={6}
								/>
							</div>
							{userDetails.roles?.name === Role.ADMIN && (
								<div className="space-y-2">
									<Label>Role</Label>
									<Select
										required
										value={formState.role_id?.toString() ?? ""}
										onValueChange={(value) => {
											setFormState({ ...formState, role_id: value });
											setValues([]);
										}}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select role" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{roles?.map((role) => (
													<SelectItem key={role.id} value={String(role.id)}>
														{toTitleCase(role.name)}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>
							)}
							{formState.role_id ===
								roles.find((role) => role.name === Role.AGENT)?.id && (
								<div className="space-y-2">
									<Label>Agent clients</Label>
									<Popover
										open={openPolicyUser}
										onOpenChange={setOpenPolicyUser}
									>
										<PopoverTrigger asChild>
											{values.length > 0 ? (
												<div className="flex gap-2 flex-wrap border border-gray-400 rounded-md px-2 py-1.5">
													{values.map((val) => (
														<span
															key={val}
															className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm"
														>
															{policyHolderUserList.find((f) => f.id === val)
																?.name ?? val}
														</span>
													))}
												</div>
											) : (
												<Button
													variant="outline"
													aria-expanded={open}
													className="justify-between w-full flex flex-wrap items-center gap-1"
												>
													<span className="text-gray-400 whitespace-nowrap">
														Select agent clients
													</span>
													<ChevronsUpDown className="opacity-50 ml-auto" />
												</Button>
											)}
										</PopoverTrigger>
										<PopoverContent className="w-full p-0">
											<Command>
												<CommandInput
													placeholder="Search agent clients"
													className="h-9"
												/>
												<CommandList>
													<CommandEmpty className="p-2 text-sm">
														No agent client found
													</CommandEmpty>
													<CommandGroup>
														{policyHolderUserList.map((user) => (
															<CommandItem
																key={user.id}
																value={user.id}
																onSelect={() => {
																	toggleValue(user.id);
																}}
															>
																{user.name}
																<Check
																	className={cn(
																		"ml-auto",
																		values.includes(user.id)
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</div>
							)}
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" className="btn-primary">
								{isEdit ? "Update" : "Add"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete User</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this user?
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
