import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface TableSkeletonLoaderProps {
	rows: number;
	columns: number;
}

export default function TableSkeletonLoader({
	rows,
	columns,
}: TableSkeletonLoaderProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					{Array.from({ length: columns }, (_, i) => (
						<TableHead key={`head-${i}`}>
							<Skeleton className="h-4 w-[120px]" />
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array.from({ length: rows }, (_, i) => (
					<TableRow key={`head-${i}`}>
						{Array.from({ length: columns }, (_, i) => (
							<TableCell key={`head-${i}`}>
								<Skeleton className="h-4 w-[120px]" />
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
