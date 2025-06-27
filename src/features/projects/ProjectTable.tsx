import { projectService } from "@/services/api/projectService";
import { useAuthStore } from "@/store";
import Table, { Column, StatusBadge } from "@/ui/Table";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";
import { reportService } from "@/services/api/reportService";

interface Project {
  id: string;
  projectName: string;
  company: string;
  startDate: string;
  pm: string;
  technician: string;
  status: string;
  latestReportId?: string;
}

interface ProjectTableProps {
  searchQuery?: string;
  sortBy?: string;
  statusFilter?: string;
  pm_ids?: string;
  technician_ids?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

const columns: Column<Project>[] = [
  {
    header: "Project Name",
    accessorKey: "projectName",
  },
  {
    header: "Company Name",
    accessorKey: "company",
  },
  {
    header: "Start Date",
    accessorKey: "startDate",
  },
  {
    header: "Project Manager",
    accessorKey: "pm",
  },
  {
    header: "Technician",
    accessorKey: "technician",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (project) => <StatusBadge status={project.status} />,
  },
];

function ProjectTable({ searchQuery, sortBy, statusFilter, pm_ids, technician_ids, startDateFrom, startDateTo }: ProjectTableProps) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const token = useAuthStore.getState().token;

   // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, searchQuery, sortBy, statusFilter, pm_ids, technician_ids, startDateFrom, startDateTo, currentPage, pageSize]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await projectService.getAllProjects(
        searchQuery,
        sortBy,
        statusFilter,
        pm_ids, 
        technician_ids,
        pageSize,
        currentPage,
        startDateFrom,
        startDateTo
      );
      
      if (response.success) {
        const mappedProjects = response.data.rows.map(project => {
          let latestReportId = undefined;
          if (project.reports && project.reports.length > 0) {
            // Get the last report (assuming sorted by creation or as latest)
            latestReportId = project.reports[project.reports.length - 1].id;
          }
          return {
            id: project.id,
            projectName: project.name,
            company: project.company?.company_name || '-',
            startDate: formatDate(project.start_date),
            pm: project.pm?.first_name + ' ' + project.pm?.last_name || '-',
            technician: project.technician?.first_name + ' ' + project.technician?.last_name || '-',
            status: project.status || 'new',
            latestReportId,
          };
        });
        
        setProjects(mappedProjects);
        setTotalCount(response.data.count);
        setError(null);
      } else {
        setError(response.message || "Failed to load projects data");
      }
    } catch (err) {
      console.error("Error fetching projects data:", err);
      setError("Failed to load projects data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleDetails = (project: Project) => {
    navigate(`/project-reports/${project.latestReportId}/view`);
  };
  
  const handleEdit = (project: Project) => {
    navigate(`/projects/${project.id}/edit`);
  };
  
  const openDeleteDialog = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      setIsLoading(true);
      const response = await projectService.deleteProject(projectToDelete.id.toString());
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Project deleted successfully",
        });
        fetchProjects();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete project",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error deleting project:", err);      
      const errorMessage = err?.data?.message || err.message || "Failed to delete project";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  // Add handler for navigating to the latest report
  const handleViewReport = (project: Project) => {
    if (project.latestReportId) {
      navigate(`/project-reports/${project.latestReportId}/edit`);
    } else {
      toast({
        title: "No Report",
        description: "No report available for this project.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      const pdfBlob = await reportService.generateReportPDF(id);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${id}.pdf`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Report PDF downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Error",
        description: "Failed to download report PDF",
        variant: "destructive",
      });
    }
  };

  // Handler to send report to customer
  const handleSendToCustomer = async (project: Project) => {
    if (!project.latestReportId) {
      toast({
        title: "No Report",
        description: "No report available to send.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await reportService.sendReportToCustomer(project.latestReportId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Report sent to customer successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to send report to customer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending report to customer:", error);
      toast({
        title: "Error",
        description: "Failed to send report to customer.",
        variant: "destructive",
      });
    }
  };

  if (isLoading && projects.length === 0) {
    return <TableSkeleton columns={5} rows={5} hasActions={true} />;
  }

  if (error && projects.length === 0) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <>
      <div>
        <Table
          columns={columns}
          data={projects}
          hasActions={true}
          onDetails={handleDetails}
          onDelete={openDeleteDialog}
          onEdit={handleEdit}
          onViewReport={handleViewReport}
          pagination={true}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isReportsTable={true}
          onDownload={(report) => report.latestReportId && handleDownloadPDF(report.latestReportId)}
          onSendToCustomer={handleSendToCustomer}
        />
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {projectToDelete?.projectName} and remove the project from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ProjectTable;
