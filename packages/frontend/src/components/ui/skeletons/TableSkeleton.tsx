import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  showHeader?: boolean;
  hasActions?: boolean;
}

export function TableSkeleton({
  columns,
  rows = 5,
  showHeader = true,
  hasActions = false,
}: TableSkeletonProps) {
  const actualColumns = hasActions ? columns + 1 : columns;
  
  return (
    <div className="w-full overflow-auto rounded-md border">
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow className="bg-safetech-gray">
              {Array(actualColumns)
                .fill(null)
                .map((_, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-6 w-full max-w-[120px]" />
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array(rows)
            .fill(null)
            .map((_, rowIndex) => (
              <TableRow key={rowIndex} className="bg-white">
                {Array(columns)
                  .fill(null)
                  .map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                {hasActions && (
                  <TableCell>
                    <div className="flex space-x-1">
                      <Skeleton className="h-9 w-10" />
                      <Skeleton className="h-9 w-10" />
                      <Skeleton className="h-9 w-10" />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
