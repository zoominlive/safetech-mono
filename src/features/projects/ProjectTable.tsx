import { projectService } from "@/services/api/projectService";
import { useAuthStore } from "@/store";
import Table, { Column, StatusBadge } from "@/ui/Table";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface Project {
  id: number;
  projectName: string;
  company: string;
  startDate: string;
  technician: string;
  status: string;
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
    header: "Technician",
    accessorKey: "technician",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (customer) => <StatusBadge status={customer.status} />,
  },
];

function ProjectTable() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore.getState().token;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await projectService.getAllProjects();
        
        if (response.success) {
          
          const mappedProjects = response.data.rows.map(project => ({
            id: Number(project.id),
            projectName: project.name, // Assuming project.name should be projectName
            company: project.company.name,
            startDate: project.start_date,
            technician: project.technician.name,
            status: project.status, // Default to active if not provided by API
          }));
          
          setProjects(mappedProjects);
          setError(null);
        } else {
          setError(response.message || "Failed to load customers data");
        }
      } catch (err) {
        console.error("Error fetching projects data:", err);
        setError("Failed to load projects data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [token]);

  const handleDetails = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  if (isLoading) {
    return <TableSkeleton columns={5} rows={5} hasActions={true} />;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div>
      <Table
        columns={columns}
        data={projects}
        hasActions={true}
        onDetails={handleDetails}
        onDelete={(customer) => console.log("Delete", customer)}
        onEdit={(customer) => console.log("Edit", customer)}
        pagination={true}
      />
    </div>
  );
}

export default ProjectTable;
