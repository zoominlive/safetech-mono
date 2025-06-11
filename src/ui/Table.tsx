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
import { useAuthStore } from "@/store";
import { Switch } from "@/components/ui/switch";

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
  // New pagination props
  currentPage?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // New props for Reports table
  isReportsTable?: boolean;
  onToggleStatus?: (id: string, currentStatus: boolean) => void;
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
  currentPage = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  onEdit,
  onDelete,
  onDetails,
  onPageSizeChange,
  isReportsTable = false,
  onToggleStatus,
}: TableProps<T>) {
  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(startIndex + data.length - 1, totalCount);
  const { user } = useAuthStore();
  
  return (
    <>
      {title && <h2 className="font-semibold text-xl mb-7">{title}</h2>}
      <div className={cn("w-full overflow-auto rounded-md border", className)}>
        <ShadcnTable>
          <TableHeader>
            <TableRow className="bg-safetech-gray hover:bg-safetech-gray">
              {columns.map((column, index) => {
                if (
                  hasActions &&
                  (column.header.toLowerCase() === "status" || column.accessorKey === "status")
                ) {
                  return (
                    <>
                      <TableHead key="actions" className="font-bold text-lg text-center">Actions</TableHead>
                      <TableHead
                        key={index}
                        className={cn(
                          "font-medium text-muted-foreground justify-end text-right",
                          column.className
                        )}
                      >
                        {column.header}
                      </TableHead>
                    </>
                  );
                }
                if (
                  hasActions &&
                  index === columns.length - 1 &&
                  !columns.some(
                    c => c.header.toLowerCase() === "status" || c.accessorKey === "status"
                  )
                ) {
                  // If no status column, add Actions at the end
                  return (
                    <>
                      <TableHead key={index} className={cn("font-medium text-muted-foreground", column.className)}>
                        {column.header}
                      </TableHead>
                      <TableHead key="actions" className="font-bold text-lg text-center">Actions</TableHead>
                    </>
                  );
                }
                return (
                  <TableHead
                    key={index}
                    className={cn(
                      column.header.toLowerCase() === "status" || column.accessorKey === "status"
                        ? "font-medium text-muted-foreground justify-end text-right"
                        : "font-medium text-muted-foreground",
                      column.className
                    )}
                  >
                    {column.header}
                  </TableHead>
                );
              })}
              {!columns.some(c => c.header.toLowerCase() === "status" || c.accessorKey === "status") && hasActions && (
                <TableHead className="font-bold text-lg text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="bg-white">
                  {columns.map((column, colIndex) => {
                    if (
                      hasActions &&
                      (column.header.toLowerCase() === "status" || column.accessorKey === "status")
                    ) {
                      return (
                        <>
                          <TableCell key={`actions-cell-${rowIndex}`} className="text-center">
                            <div className="flex justify-center space-x-2">
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
                              {onEdit && user?.role !== 'Technician' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => onEdit(row)}
                                  className="px-2 py-1 h-8"
                                >
                                  <SquarePen className="h-4 w-4" />
                                </Button>
                              )}
                              {onDelete && user?.role !== 'Technician' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => onDelete(row)}
                                  className="px-2 py-1 h-8 text-red-500 hover:text-red-700"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                              {isReportsTable && onToggleStatus && (
                                <TableCell className="text-center">
                                  <Switch
                                    checked={(row as any).status}
                                    onCheckedChange={() => onToggleStatus((row as any).id, (row as any).status)}
                                    className="bg-sf-black-300 data-[state=unchecked]:bg-sf-black-300"
                                  />
                                </TableCell>
                              )}
                            </div>
                          </TableCell>
                          <TableCell key={`status-cell-${rowIndex}`} className={cn("justify-end text-right", column.className)}>
                            {column.cell
                              ? column.cell(row)
                              : (row[column.accessorKey] as React.ReactNode)}
                          </TableCell>
                        </>
                      );
                    }
                    if (
                      hasActions &&
                      colIndex === columns.length - 1 &&
                      !columns.some(
                        c => c.header.toLowerCase() === "status" || c.accessorKey === "status"
                      )
                    ) {
                      // If no status column, add Actions at the end
                      return (
                        <>
                          <TableCell key={colIndex} className={column.className}>
                            {column.cell
                              ? column.cell(row)
                              : (row[column.accessorKey] as React.ReactNode)}
                          </TableCell>
                          <TableCell key={`actions-cell-${rowIndex}`} className="text-center">
                            <div className="flex justify-center space-x-2">
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
                              {onEdit && user?.role !== 'Technician' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => onEdit(row)}
                                  className="px-2 py-1 h-8"
                                >
                                  <SquarePen className="h-4 w-4" />
                                </Button>
                              )}
                              {onDelete && user?.role !== 'Technician' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => onDelete(row)}
                                  className="px-2 py-1 h-8 text-red-500 hover:text-red-700"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                              {isReportsTable && onToggleStatus && (
                                <TableCell className="text-center">
                                  <Switch
                                    checked={(row as any).status}
                                    onCheckedChange={() => onToggleStatus((row as any).id, (row as any).status)}
                                    className="bg-sf-black-300 data-[state=unchecked]:bg-sf-black-300"
                                  />
                                </TableCell>
                              )}
                            </div>
                          </TableCell>
                        </>
                      );
                    }
                    // Normal cell
                    return (
                      <TableCell key={colIndex} className={cn(
                        column.header.toLowerCase() === "status" || column.accessorKey === "status"
                          ? "justify-end text-right"
                          : "",
                        column.className
                      )}>
                        {column.cell
                          ? column.cell(row)
                          : (row[column.accessorKey] as React.ReactNode)}
                      </TableCell>
                    );
                  })}
                  {!columns.some(c => c.header.toLowerCase() === "status" || c.accessorKey === "status") && hasActions && (
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
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
                        {onEdit && user?.role !== 'Technician' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onEdit(row)}
                            className="px-2 py-1 h-8"
                          >
                            <SquarePen className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && user?.role !== 'Technician' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onDelete(row)}
                            className="px-2 py-1 h-8 text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                        {isReportsTable && onToggleStatus && (
                          <TableCell className="text-center">
                            <Switch
                              checked={(row as any).status}
                              onCheckedChange={() => onToggleStatus((row as any).id, (row as any).status)}
                              className="bg-sf-black-300 data-[state=unchecked]:bg-sf-black-300"
                            />
                          </TableCell>
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
                      Showing {startIndex}-{endIndex} of {totalCount}
                    </span>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <span>Rows per page:</span>
                        <select
                          className="border rounded px-2 py-1 text-sm focus:outline-none"
                          value={pageSize}
                          onChange={e => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
                        >
                          {[5, 10, 20, 50, 100].map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange && onPageChange(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span>
                        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange && onPageChange(currentPage + 1)}
                      >
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
