import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  title?: string;
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium rounded px-3 py-1 border-0",
        getStatusColor(status)
      )}
    >
      {status}
    </Badge>
  );
};

function Table<T>({ columns, data, className, title }: TableProps<T>) {
  return (
    <>
      {title && <h3 className="font-semibold text-lg">{title}</h3>}
      <div className={cn("w-full overflow-auto", className)}>
        <ShadcnTable>
          <TableHeader>
            <TableRow className="bg-safetech-gray rounded-t-2xl">
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className="font-medium text-muted-foreground"
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {column.cell
                      ? column.cell(row)
                      : (row[column.accessorKey] as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </ShadcnTable>
      </div>
    </>
  );
}

export default Table;
