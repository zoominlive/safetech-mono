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

  const handleSendToCustomer = async () => {}

  const inProgressColumns: Column<InProgressProject>[] = [
    {
      header: "Project Name",
      accessorKey: "projectName",
    },
    {
      header: "Company",
      accessorKey: "company",
    },
    {
      header: "Start Date",
      accessorKey: "startDate",
      cell: (project) => {
        return formatDate(project.startDate);
      },
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

  const awaitingReviewColumns: Column<AwaitingReviewProject>[] = [
    {
      header: "Project Name",
      accessorKey: "projectName",
    },
    {
      header: "Company",
      accessorKey: "company",
    },
    {
      header: "Completed Date",
      accessorKey: "completedDate",
      cell: (project) => {
        return formatDate(project.completedDate);
      },
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
              onSendToCustomer={() => handleSendToCustomer()}
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
              onSendToCustomer={() => handleSendToCustomer()}
            />
          </div>
          <div className="overflow-x-auto">
            <Table 
              columns={awaitingReviewColumns} 
              data={awaitingReviewProjects} 
              title="Awaiting PM Review" 
              hasActions={true}
              onDetails={handleProjectDetails}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardLayout;
