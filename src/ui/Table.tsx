import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  hasActions?: boolean;
  className?: string;
  title?: string;
  onDetails?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  pagination?: boolean;
}

export const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "on hold":
        return "bg-gray-100 text-gray-800";
      case "active":
        return "bg-sf-customer-active text-sf-customer-text";
      case "inactive":
        return "bg-sf-customer-inactive text-sf-customer-text";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium rounded px-3 py-1 border-0 capitalize w-24 h-7 font-inter",
        getStatusColor(status)
      )}
    >
      {status}
    </Badge>
  );
};

function Table<T>({
  columns,
  data,
  className,
  title,
  hasActions = false,
  pagination = false,
  onEdit,
  onDelete,
  onDetails,
}: TableProps<T>) {
  return (
    <>
      {title && <h2 className="font-semibold text-xl mb-7">{title}</h2>}
      <div className={cn("w-full overflow-auto rounded-md border", className)}>
        <ShadcnTable>
          <TableHeader>
            <TableRow className="bg-safetech-gray">
              {columns.map((column, index) => (
                <TableHead key={index} className="font-bold text-lg">
                  {column.header}
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="font-bold text-lg">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="bg-white">
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {column.cell
                      ? column.cell(row)
                      : (row[column.accessorKey] as React.ReactNode)}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell>
                    <div>
                      {onDetails && (
                        <Button
                          variant="outline"
                          className="rounded-r-none"
                          onClick={() => onDetails(row)}
                        >
                          <Eye />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="outline"
                          className="rounded-none"
                          onClick={() => onEdit(row)}
                        >
                          <SquarePen />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="outline"
                          className="rounded-l-none"
                          onClick={() => onDelete(row)}
                        >
                          <Trash2 className="text-red-400" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
          {pagination && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Showing 1-12 of 100</TableCell>
                <TableCell colSpan={2}>
                  <Pagination className="justify-end">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>
                          2
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </ShadcnTable>
      </div>
    </>
  );
}

export default Table;
