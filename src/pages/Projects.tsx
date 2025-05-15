import ProjectTable from "@/features/projects/ProjectTable";
import ProjectTableOperations from "@/features/projects/ProjectTableOperations";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  
  return (
    <div className="space-y-4">
      <ProjectTableOperations 
        onSearch={setSearchQuery} 
        onFilterStatus={setStatusFilter}
        onDateRangeChange={setDateRange}
      />
      <ProjectTable searchQuery={searchQuery} statusFilter={statusFilter} />
    </div>
  );
}

export default Projects;
