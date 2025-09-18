import Table, { Column, StatusBadge } from "@/ui/Table";
import Stats from "./Stats";
import { useAuthStore } from "@/store";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services/api/dashboardService";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { StatsSkeleton } from "@/components/ui/skeletons/StatsSkeleton";
import { formatDate } from "@/lib/utils";
import { useNavigate } from "react-router";
import { reportService } from "@/services/api/reportService";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    overview: {
      totalOpenProjects: number;
      projectsCompletedLast30Days: number;
      avgTimeToComplete: number;
      projectsOlderThan48Hrs: number;
      mtd: {
      totalOpenProjectsChange: any,
      projectsCompletedChange: any,
      avgTimeChange: any,
      projectsOlderThan48HrsChange: any
    }
    };
    inProgress: Array<{
      id: string;
      projectName: string;
      company: string;
      startDate: string | Date;
      technician: string;
      technicians: string[];
      status: string;
      reports: Array<{
        id: string;
        reportName: string;
      }>;
    }>;
    newProjects: Array<{
      id: string;
      projectName: string;
      company: string;
      startDate: string | Date;
      technician: string;
      technicians: string[];
      status: string;
      reports: Array<{
        id: string;
        reportName: string;
      }>;
    }>;
    awaitingReview: Array<{
      id: string;
      projectName: string;
      company: string;
      completedDate: string | Date;
      reports: Array<{
        id: string;
        reportName: string;
      }>;
    }>;
  };
}

interface InProgressProject {
  id: string;
  projectName: string;
  company: string;
  startDate: string | Date;
  technician: string;
  technicians: string[];
  status: string;
  latestReportId?: string;
}

interface AwaitingReviewProject {
  id: string;
  projectName: string;
  company: string;
  completedDate: string | Date;
  latestReportId?: string;
}

// Project type can be either in progress or awaiting review

function DashboardLayout() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState({
    totalOpenProjects: 0,
    projectsCompletedLast30Days: 0,
    avgTimeToComplete: 0,
    projectsOlderThan48Hrs: 0,
    mtd: {
      totalOpenProjectsChange: 0,
      projectsCompletedChange: 0,
      avgTimeChange: 0,
      projectsOlderThan48HrsChange: 0
    }
  });
  const [inProgressProjects, setInProgressProjects] = useState<InProgressProject[]>([]);
  const [newProjects, setNewProjects] = useState<InProgressProject[]>([]);
  const [awaitingReviewProjects, setAwaitingReviewProjects] = useState<AwaitingReviewProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);
  const [sendingToCustomerId, setSendingToCustomerId] = useState<string | null>(null);

  const token = useAuthStore.getState().token;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await dashboardService.dashboard();
        const dashboardData = response as DashboardResponse;

        if (dashboardData.success) {
          setOverview(dashboardData.data.overview);
          
          // Map inProgress projects with latest report ID
          const mappedInProgress = (dashboardData.data.inProgress || []).map(project => ({
            id: project.id,
            projectName: project.projectName,
            company: project.company,
            startDate: project.startDate,
            technician: project.technician,
            technicians: project.technicians,
            status: project.status,
            latestReportId: project.reports && project.reports.length > 0 
              ? project.reports[project.reports.length - 1].id 
              : undefined
          }));
          
          // Map new projects with latest report ID
          const mappedNewProjects = (dashboardData.data.newProjects || []).map(project => ({
            id: project.id,
            projectName: project.projectName,
            company: project.company,
            startDate: project.startDate,
            technician: project.technician,
            technicians: project.technicians,
            status: project.status,
            latestReportId: project.reports && project.reports.length > 0 
              ? project.reports[project.reports.length - 1].id 
              : undefined
          }));
          
          // Map awaiting review projects with latest report ID
          const mappedAwaitingReview = (dashboardData.data.awaitingReview || []).map(project => ({
            id: project.id,
            projectName: project.projectName,
            company: project.company,
            completedDate: project.completedDate,
            latestReportId: project.reports && project.reports.length > 0 
              ? project.reports[project.reports.length - 1].id 
              : undefined
          }));
          
          setInProgressProjects(mappedInProgress);
          setNewProjects(mappedNewProjects);
          setAwaitingReviewProjects(mappedAwaitingReview);
          setError(null);
        } else {
          setError(dashboardData.message || "Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const handleProjectDetails = (project: InProgressProject | AwaitingReviewProject) => {
    
    if (project.latestReportId) {
      navigate(`/project-reports/${project.latestReportId}/view`);
    } else {
      // If no report exists, navigate to project details
      navigate(`/projects/${project.id}`);
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      setDownloadingReportId(id);
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
    } finally {
      setDownloadingReportId(null);
    }
  };

  const handleSendToCustomer = async (project: InProgressProject | AwaitingReviewProject) => {
    if (!project.latestReportId) {
      toast({
        title: "No Report",
        description: "No report available to send.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSendingToCustomerId(project.latestReportId);
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
    } finally {
      setSendingToCustomerId(null);
    }
  };

  const inProgressColumns: Column<InProgressProject>[] = [
    {
      header: "Project Name",
      accessorKey: "projectName",
      width: "min-w-[120px] max-w-[160px] sm:min-w-[220px] sm:max-w-[220px]",
      cell: (project) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate block">{project.projectName}</span>
            </TooltipTrigger>
            <TooltipContent>{project.projectName}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      header: "Company",
      accessorKey: "company",
      width: "min-w-[80px] max-w-[120px] sm:min-w-[120px] sm:max-w-[160px]",
      cell: (project) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate block">{project.company}</span>
            </TooltipTrigger>
            <TooltipContent>{project.company}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      header: "Start Date",
      accessorKey: "startDate",
      cell: (project) => {
        return formatDate(project.startDate);
      },
      width: "min-w-[90px] max-w-[110px] sm:min-w-[120px] sm:max-w-[140px]",
    },
    {
      header: "Technician",
      accessorKey: "technicians",
      width: "min-w-[90px] max-w-[120px] sm:min-w-[140px] sm:max-w-[160px]",
      cell: (project) => {
        const techNames = Array.isArray(project.technicians)
          ? project.technicians.join(", ")
          : (project.technicians as unknown as string) || "";
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate block">{techNames}</span>
              </TooltipTrigger>
              <TooltipContent>{techNames}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (project) => <StatusBadge status={project.status} />,
      width: "min-w-[70px] max-w-[90px] sm:min-w-[100px] sm:max-w-[120px]",
    },
  ];

  const awaitingReviewColumns: Column<AwaitingReviewProject>[] = [
    {
      header: "Project Name",
      accessorKey: "projectName",
      width: "min-w-[120px] max-w-[160px] sm:min-w-[220px] sm:max-w-[220px]",
      cell: (project) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate block">{project.projectName}</span>
            </TooltipTrigger>
            <TooltipContent>{project.projectName}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      header: "Company",
      accessorKey: "company",
      width: "min-w-[80px] max-w-[120px] sm:min-w-[120px] sm:max-w-[160px]",
      cell: (project) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate block">{project.company}</span>
            </TooltipTrigger>
            <TooltipContent>{project.company}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      header: "Completed Date",
      accessorKey: "completedDate",
      cell: (project) => {
        return formatDate(project.completedDate);
      },
      width: "min-w-[90px] max-w-[110px] sm:min-w-[120px] sm:max-w-[140px]",
    },
  ];

  return (
    <div className="flex flex-col space-y-4 md:space-y-6">
      {isLoading ? (
        <>
          <StatsSkeleton />
          <TableSkeleton columns={5} rows={3} />
          <TableSkeleton columns={3} rows={3} />
        </>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          <Stats overview={overview} />
          <div className="overflow-x-auto">
            <Table 
              columns={inProgressColumns} 
              data={newProjects} 
              title="New" 
              hasActions={true}
              onDetails={handleProjectDetails}
              isReportsTable={true}
              onEdit={(report) => navigate(`/project-reports/${report.latestReportId}/edit`)}
              onDownload={(report) => report.latestReportId && handleDownloadPDF(report.latestReportId)}
              onSendToCustomer={(project) => handleSendToCustomer(project)}
              downloadingReportId={downloadingReportId}
              sendingToCustomerId={sendingToCustomerId}
            />
          </div>
          <div className="overflow-x-auto">
            <Table 
              columns={inProgressColumns} 
              data={inProgressProjects} 
              title="In Progress" 
              hasActions={true}
              onDetails={handleProjectDetails}
              isReportsTable={true}
              onEdit={(report) => navigate(`/project-reports/${report.latestReportId}/edit`)}
              onDownload={(report) => report.latestReportId && handleDownloadPDF(report.latestReportId)}
              onSendToCustomer={(project) => handleSendToCustomer(project)}
              downloadingReportId={downloadingReportId}
              sendingToCustomerId={sendingToCustomerId}
            />
          </div>
          <div className="overflow-x-auto">
            <Table 
              columns={awaitingReviewColumns} 
              data={awaitingReviewProjects} 
              title="Awaiting PM Review" 
              hasActions={true}
              onDetails={handleProjectDetails}
              downloadingReportId={downloadingReportId}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardLayout;
