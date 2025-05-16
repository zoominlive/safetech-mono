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

interface Project {
  id: number;
  projectName: string;
  company: string;
  startDate: string;
  technician: string;
  status: string;
}

interface ProjectTableProps {
  searchQuery?: string;
  sortBy?: string;
  statusFilter?: string;
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
    cell: (project) => <StatusBadge status={project.status} />,
  },
];

function ProjectTable({ searchQuery, sortBy, statusFilter }: ProjectTableProps) {
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
  }, [token, searchQuery, sortBy, statusFilter, currentPage, pageSize]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await projectService.getAllProjects(searchQuery, sortBy, statusFilter, pageSize, currentPage);
      
      if (response.success) {
        const mappedProjects = response.data.rows.map(project => ({
          id: Number(project.id),
          projectName: project.name,
          company: project.company?.name || '-',
          startDate: formatDate(project.start_date),
          technician: project.technician?.name || '-',
          status: project.status || 'new',
        }));
        
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDetails = (project: Project) => {
    navigate(`/projects/${project.id}`);
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
          pagination={true}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
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
