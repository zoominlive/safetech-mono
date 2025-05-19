import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, SquarePen } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { reportService } from "@/services/api/reportService";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { toast } from "@/components/ui/use-toast";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";

interface Report {
  id: number;
  name: string;
  created_at: string;
  completed_reports: number;
  status: boolean;
}

interface ReportsTableProps {
  searchQuery?: string;
  sortBy?: string;
}

const ReportsTable: React.FC<ReportsTableProps> = ({ searchQuery, sortBy }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore.getState().token;

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    fetchReports();
  }, [token, searchQuery, sortBy, currentPage, pageSize]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await reportService.getAllReports(
        searchQuery,
        sortBy,
        pageSize,
        currentPage
      );

      if (response.success) {
        setReports(response.data.rows);
        setTotalCount(response.data.count);
        setError(null);
      } else {
        setError(response.message || "Failed to load reports data");
      }
    } catch (err) {
      console.error("Error fetching reports data:", err);
      setError("Failed to load reports data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await reportService.toggleReportStatus(
        id.toString(),
        !currentStatus
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Report ${
            !currentStatus ? "enabled" : "disabled"
          } successfully`,
        });
        fetchReports();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update report status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling report status:", error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading && reports.length === 0) {
    return <TableSkeleton columns={6} rows={3} />;
  }

  if (error && reports.length === 0) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div className="rounded border">
      <Table>
        <TableHeader>
          <TableRow className="bg-safetech-gray h-[70px]">
            <TableHead>Report Name</TableHead>
            <TableHead className="text-center">Created Date</TableHead>
            <TableHead className="text-center">Completed Reports</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Action</TableHead>
            <TableHead className="text-center">Enable/Disable</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length > 0 ? (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.name}</TableCell>
                <TableCell className="text-center">
                  {formatDate(report.created_at)}
                </TableCell>
                <TableCell className="text-center">
                  {report.completed_reports || 0}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={`${
                      report.status ? "bg-[#178D17]" : "bg-red-500"
                    } rounded py-1.5 px-3`}
                  >
                    {report.status ? "Enabled" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    className="rounded-r-none"
                    onClick={() => navigate(`/reports/${report.id}`)}
                  >
                    <Eye />
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-l-none"
                    onClick={() => navigate(`/reports/${report.id}/edit`)}
                  >
                    <SquarePen />
                  </Button>
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={report.status}
                    onCheckedChange={() =>
                      handleToggleStatus(report.id, report.status)
                    }
                    className="bg-sf-black-300 data-[state=unchecked]:bg-sf-black-300"
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No reports found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {reports.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>
                Showing{" "}
                {(currentPage - 1) * pageSize + 1}-{Math.min(
                  currentPage * pageSize,
                  totalCount
                )}{" "}
                of {totalCount}
              </TableCell>
              <TableCell colSpan={3}>
                <Pagination className="justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          currentPage > 1 &&
                          handlePageChange(currentPage - 1)
                        }
                        className={
                          currentPage <= 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {/* Generate page numbers */}
                    {Array.from(
                      { length: Math.min(5, Math.ceil(totalCount / pageSize)) },
                      (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => handlePageChange(i + 1)}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    {Math.ceil(totalCount / pageSize) > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          currentPage < Math.ceil(totalCount / pageSize) &&
                          handlePageChange(currentPage + 1)
                        }
                        className={
                          currentPage >= Math.ceil(totalCount / pageSize)
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
};

export default ReportsTable;
