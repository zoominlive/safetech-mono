import Table, { Column } from "@/ui/Table";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { reportService } from "@/services/api/reportService";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { toast } from "@/components/ui/use-toast";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";

interface Report {
  id: string;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
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
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: Column<Report>[] = [
    {
      header: "Report Name",
      accessorKey: "name",
    },
    {
      header: "Created Date",
      accessorKey: "created_at",
      className: "text-center",
      cell: (report) => (
        <span className="text-center">{formatDate(report.created_at)}</span>
      ),
    },
    {
      header: "Completed Reports",
      accessorKey: "completed_reports",
      className: "text-center",
      cell: (report) => <span className="text-center">{report.completed_reports || 0}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      className: "text-center",
      cell: (report) => (
        <span className="text-center">
          <span
            className={`rounded py-1.5 px-3 text-white text-sm ${
              report.status ? "bg-[#178D17]" : "bg-red-500"
            }`}
          >
            {report.status ? "Enabled" : "Disabled"}
          </span>
        </span>
      ),
    },
  ];

  if (isLoading && reports.length === 0) {
    return <TableSkeleton columns={6} rows={3} hasActions={true} />;
  }

  if (error && reports.length === 0) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <>
      <Table
        columns={columns}
        data={reports}
        hasActions={true}
        onDetails={(report) => navigate(`/reports/${report.id}`)}
        onEdit={(report) => navigate(`/reports/${report.id}/edit`)}
        pagination={true}
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isReportsTable={true}
        onToggleStatus={handleToggleStatus}
      />
    </>
  );
};

export default ReportsTable;
