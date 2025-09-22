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
import { Eye, SquarePen, Trash, Download, FileChartLine, Send, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { MoreVertical } from "lucide-react";
import React from "react";

export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  width?: string;
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
  onDownload?: (row: T) => void;
  onViewReport?: (row: T) => void;
  pagination?: boolean;
  // New pagination props
  currentPage?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // New props for Reports table
  isReportsTable?: boolean;
  isReportsTemplateTable?: boolean;
  onToggleStatus?: (id: string, currentStatus: boolean) => void;
  // Add new prop for sending to customer
  onSendToCustomer?: (row: T) => void;
  // Add prop for downloading report ID
  downloadingReportId?: string | null;
  // Add prop for sending to customer ID
  sendingToCustomerId?: string | null;
  // Add prop for resending invitation (Users table)
  onResendInvitation?: (row: T) => void;
  // Track which row is currently resending
  resendingInvitationId?: string | null;
}

export const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-orange-100 text-orange-800";
      case "pm review":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "on hold":
        return "bg-gray-100 text-gray-800";
      case "active":
        return "bg-sf-customer-active text-sf-black-300";
      case "inactive":
        return "bg-sf-customer-inactive text-sf-black-300";
      case "invited":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium rounded border-0 capitalize font-inter",
        "w-auto h-auto px-2 py-0.5 text-xs sm:w-24 sm:h-7 sm:px-3 sm:py-1 sm:text-base",
        getStatusColor(status)
      )}
    >
      {status}
    </Badge>
  );
};

// Add ActionType type for actions
interface ActionType {
  key: string;
  button: React.ReactElement;
  menu: React.ReactElement;
}

function ActionsCell({ row, ...props }: any) {
  const {
    onDetails,
    onEdit,
    onDelete,
    onDownload,
    onViewReport,
    isReportsTable,
    isReportsTemplateTable,
    onToggleStatus,
    onSendToCustomer,
    downloadingReportId,
    sendingToCustomerId,
    onResendInvitation,
    resendingInvitationId,
    user,
  } = props;
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Build actions array for easier logic
  const actionsRaw: (ActionType | null)[] = [
    onDetails && !isReportsTemplateTable ? {
      key: 'view',
      button: (
        <Button
          key="view"
          variant="outline"
          size="sm"
          onClick={() => onDetails(row)}
          className="px-2 py-1 h-8"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
      menu: (
        <Button
          key="view-menu"
          variant="ghost"
          size="sm"
          onClick={() => onDetails(row)}
          className="justify-start w-full"
        >
          <Eye className="h-4 w-4 mr-2" /> View
        </Button>
      )
    } : null,
    // Resend Invitation action: hide for Technician role
    onResendInvitation && user?.role?.toLowerCase() !== 'technician' ? {
      key: 'resendInvite',
      button: (
        <Button
          key="resendInvite"
          variant="outline"
          size="sm"
          onClick={() => onResendInvitation(row)}
          className="px-2 py-1 h-8"
          title="Resend invitation"
          disabled={
            resendingInvitationId === (row as any).id ||
            !((row as any)?.status && typeof (row as any).status === 'string' && (row as any).status.toLowerCase() === 'invited')
          }
        >
          {resendingInvitationId === (row as any).id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      ),
      menu: (
        <Button
          key="resendInvite-menu"
          variant="ghost"
          size="sm"
          onClick={() => onResendInvitation(row)}
          className="justify-start w-full"
          title="Resend invitation"
          disabled={
            resendingInvitationId === (row as any).id ||
            !((row as any)?.status && typeof (row as any).status === 'string' && (row as any).status.toLowerCase() === 'invited')
          }
        >
          {resendingInvitationId === (row as any).id ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Resend Invitation
        </Button>
      )
    } : null,
    onEdit && isReportsTable && !isReportsTemplateTable ? {
      key: 'edit',
      button: (
        <Button
          key="edit"
          variant="outline"
          size="sm"
          onClick={() => onEdit(row)}
          className="px-2 py-1 h-8"
        >
          <SquarePen className="h-4 w-4" />
        </Button>
      ),
      menu: (
        <Button
          key="edit-menu"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(row)}
          className="justify-start w-full"
        >
          <SquarePen className="h-4 w-4 mr-2" /> Edit
        </Button>
      )
    } : null,
    onViewReport ? {
      key: 'viewReport',
      button: (
        <Button
          key="viewReport"
          variant="outline"
          size="sm"
          onClick={() => onViewReport(row)}
          className="px-2 py-1 h-8"
          title="View Latest Report"
        >
          <FileChartLine className="h-4 w-4" />
        </Button>
      ),
      menu: (
        <Button
          key="viewReport-menu"
          variant="ghost"
          size="sm"
          onClick={() => onViewReport(row)}
          className="justify-start w-full"
          title="View Latest Report"
        >
          <FileChartLine className="h-4 w-4 mr-2" /> Fill Report
        </Button>
      )
    } : null,
    onDownload && isReportsTable ? {
      key: 'download',
      button: (
        <Button
          key="download"
          variant="outline"
          size="sm"
          onClick={() => onDownload(row)}
          className="px-2 py-1 h-8"
          disabled={
            downloadingReportId !== (row as any).latestReportId &&
            typeof (row as any).status === 'string' &&
            ["in progress", "new"].includes((row as any).status.toLowerCase())
          }
        >
          {downloadingReportId === (row as any).latestReportId ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      ),
      menu: (
        <Button
          key="download-menu"
          variant="ghost"
          size="sm"
          onClick={() => onDownload(row)}
          className="justify-start w-full"
          disabled={
            downloadingReportId !== (row as any).latestReportId &&
            typeof (row as any).status === 'string' &&
            ["in progress", "new"].includes((row as any).status.toLowerCase())
          }
        >
          {downloadingReportId === (row as any).latestReportId ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download
        </Button>
      )
    } : null,
    onSendToCustomer && user?.role?.toLowerCase() === 'project manager' && isReportsTable ? {
      key: 'send',
      button: (
        <Button
          key="send"
          variant="outline"
          size="sm"
          onClick={() => onSendToCustomer(row)}
          className="px-2 py-1 h-8"
          disabled={
            typeof (row as any).status === 'string' &&
            ["in progress", "new"].includes((row as any).status.toLowerCase()) ||
            sendingToCustomerId === (row as any).latestReportId
          }
          title="Send report to customer"
        >
          {sendingToCustomerId === (row as any).latestReportId ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      ),
      menu: (
        <Button
          key="send-menu"
          variant="ghost"
          size="sm"
          onClick={() => onSendToCustomer(row)}
          className="justify-start w-full"
          disabled={
            typeof (row as any).status === 'string' &&
            ["in progress", "new"].includes((row as any).status.toLowerCase()) ||
            sendingToCustomerId === (row as any).latestReportId
          }
          title="Send report to customer"
        >
          {sendingToCustomerId === (row as any).latestReportId ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send to Customer
        </Button>
      )
    } : null,
    onDelete && user?.role !== 'Technician' && !isReportsTemplateTable ? {
      key: 'delete',
      button: (
        <Button
          key="delete"
          variant="outline"
          size="sm"
          onClick={() => onDelete(row)}
          className="px-2 py-1 h-8 text-red-500 hover:text-red-700"
        >
          <Trash className="h-4 w-4" />
        </Button>
      ),
      menu: (
        <Button
          key="delete-menu"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(row)}
          className="justify-start w-full text-red-500 hover:text-red-700"
        >
          <Trash className="h-4 w-4 mr-2" /> Delete
        </Button>
      )
    } : null,
    isReportsTemplateTable && onToggleStatus ? {
      key: 'toggle',
      button: (
        <div key="toggle" className="flex flex-col items-center">
          <Switch
            checked={(row as any).status}
            onCheckedChange={() => onToggleStatus((row as any).id, (row as any).status)}
            className="bg-sf-black-300 data-[state=unchecked]:bg-sf-black-300"
          />
        </div>
      ),
      menu: (
        <div key="toggle-menu" className="flex flex-col items-start w-full px-2 py-1">
          <span className="text-xs mb-1">Active</span>
          <Switch
            checked={(row as any).status}
            onCheckedChange={() => onToggleStatus((row as any).id, (row as any).status)}
            className="bg-sf-black-300 data-[state=unchecked]:bg-sf-black-300"
          />
        </div>
      )
    } : null,
  ].filter((a): a is NonNullable<ActionType> => a != null);
  const actions: ActionType[] = actionsRaw.filter((a): a is ActionType => a != null);

  // Mobile: always kebab
  if (isMobile) {
    return (
      <div className="flex justify-center items-center gap-1 overflow-hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="px-2 py-1 h-8"><MoreVertical className="h-4 w-4" /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-2 flex flex-col gap-1">
            {actions.map(a => a.menu)}
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Tablet and up: if more than 3 actions, show first 2 as buttons, rest in kebab
  if (actions.length > 3) {
    return (
      <div className="flex justify-center items-center gap-1 overflow-hidden">
        {actions.slice(0, 2).map(a => a.button)}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="px-2 py-1 h-8"><MoreVertical className="h-4 w-4" /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-2 flex flex-col gap-1">
            {actions.slice(2).map(a => a.menu)}
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Tablet and up: 3 or fewer actions, show all as buttons
  return (
    <div className="flex justify-center items-center gap-1 overflow-hidden">
      {actions.map(a => a.button)}
    </div>
  );
}

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
  onDownload,
  onViewReport,
  onPageSizeChange,
  isReportsTable = false,
  isReportsTemplateTable = false,
  onToggleStatus,
  onSendToCustomer,
  downloadingReportId,
  sendingToCustomerId,
  onResendInvitation,
  resendingInvitationId,
}: TableProps<T>) {
  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(startIndex + data.length - 1, totalCount);
  const { user } = useAuthStore();
  
  return (
    <>
      {title && <h2 className="font-semibold text-xl mb-7">{title}</h2>}
      <div className={cn("w-full overflow-x-auto rounded-md border", className)}>
        <ShadcnTable className="min-w-full table-fixed">
          <TableHeader>
            <TableRow className="bg-safetech-gray hover:bg-safetech-gray">
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    "font-medium text-muted-foreground truncate overflow-hidden whitespace-nowrap",
                    column.className,
                    column.width
                  )}
                  style={column.width ? undefined : {}}
                >
                  {column.header}
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="font-bold text-lg text-center min-w-[180px] max-w-[220px] sm:min-w-[220px] sm:max-w-[260px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex} 
                  className={cn("bg-white", onDetails && !isReportsTemplateTable && "cursor-pointer hover:bg-gray-100")}
                  onClick={onDetails && !isReportsTemplateTable ? (e => {
                    // Prevent row click if a button or its child is clicked
                    if ((e.target as HTMLElement).closest('button')) return;
                    onDetails(row);
                  }) : undefined}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell 
                      key={colIndex} 
                      className={cn(
                        column.className,
                        column.width,
                        "truncate overflow-hidden whitespace-nowrap max-w-[220px]"
                      )}
                      style={column.width ? undefined : {}}
                    >
                      {column.cell
                        ? column.cell(row)
                        : (row[column.accessorKey] as React.ReactNode)}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell className="text-center min-w-[120px] max-w-[160px] sm:min-w-[160px] sm:max-w-[200px]">
                      <ActionsCell
                        row={row}
                        onDetails={onDetails}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onDownload={onDownload}
                        onViewReport={onViewReport}
                        isReportsTable={isReportsTable}
                        isReportsTemplateTable={isReportsTemplateTable}
                        onToggleStatus={onToggleStatus}
                        onSendToCustomer={onSendToCustomer}
                        downloadingReportId={downloadingReportId}
                        sendingToCustomerId={sendingToCustomerId}
                        onResendInvitation={onResendInvitation}
                        resendingInvitationId={resendingInvitationId}
                        user={user}
                      />
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
                  No Projects In Review
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
