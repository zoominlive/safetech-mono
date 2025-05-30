import Table, { Column, StatusBadge } from "@/ui/Table";
import Stats from "./Stats";
import { useAuthStore } from "@/store";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services/api/dashboardService";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { StatsSkeleton } from "@/components/ui/skeletons/StatsSkeleton";
import { formatDate } from "@/lib/utils";

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
    };
    inProgress: InProgressProject[];
    newProjects: InProgressProject[];
    awaitingReview: AwaitingReviewProject[];
  };
}

interface InProgressProject {
  projectName: string;
  company: string;
  startDate: string | Date;
  technician: string;
  status: string;
}

interface AwaitingReviewProject {
  projectName: string;
  company: string;
  completedDate: string | Date;
}

// Project type can be either in progress or awaiting review

function DashboardLayout() {
  const [overview, setOverview] = useState({
    totalOpenProjects: 0,
    projectsCompletedLast30Days: 0,
    avgTimeToComplete: 0,
    projectsOlderThan48Hrs: 0,
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
          setInProgressProjects(dashboardData.data.inProgress || []);
          setNewProjects(dashboardData.data.newProjects || []);
          setAwaitingReviewProjects(dashboardData.data.awaitingReview || []);
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
            <Table columns={inProgressColumns} data={newProjects} title="New" />
          </div>
          <div className="overflow-x-auto">
            <Table columns={inProgressColumns} data={inProgressProjects} title="In Progress" />
          </div>
          <div className="overflow-x-auto">
            <Table columns={awaitingReviewColumns} data={awaitingReviewProjects} title="Awaiting PM Review" />
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardLayout;
