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
import { Eye, SquarePen, Trash } from "lucide-react";

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
        return "bg-sf-customer-active text-sf-black-300";
      case "inactive":
        return "bg-sf-customer-inactive text-sf-black-300";
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
            <TableRow className="bg-safetech-gray hover:bg-safetech-gray">
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    "font-medium text-muted-foreground",
                    column.className
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="font-bold text-lg">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="bg-white">
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {column.cell
                        ? column.cell(row)
                        : (row[column.accessorKey] as React.ReactNode)}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell>
                      <div className="flex space-x-2">
                        {onDetails && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onDetails(row)}
                            className="px-2 py-1 h-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onEdit(row)}
                            className="px-2 py-1 h-8"
                          >
                            <SquarePen className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onDelete(row)}
                            className="px-2 py-1 h-8 text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="text-center py-8"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {pagination && data.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="py-2">
                  <div className="flex items-center justify-between">
                    <span>
                      Showing {Math.min(1, data.length)}-{data.length} of {data.length}
                    </span>
                    <div className="flex items-center space-x-6">
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                      <span>
                        Page <strong>1</strong> of <strong>1</strong>
                      </span>
                      <Button variant="outline" size="sm" disabled>
                        Next
                      </Button>
                    </div>
                  </div>
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
