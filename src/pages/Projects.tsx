import ProjectTable from "@/features/projects/ProjectTable";
import ProjectTableOperations from "@/features/projects/ProjectTableOperations";
import { ColumnDef } from "@tanstack/react-table";

type Project = {
  id: string;
  projectName: string;
  companyName: string;
  startDate: Date;
  technician: string;
  status: "new" | "resent" | "completed" | "started";
};

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "projectName",
    header: "Project Name",
  },
  {
    accessorKey: "companyName",
    header: "Company Name",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
  },
  {
    accessorKey: "technician",
    header: "Technician",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

function Projects() {
  return (
    <div className="space-y-4">
      <ProjectTableOperations />
      <ProjectTable />
    </div>
  );
}

export default Projects;
