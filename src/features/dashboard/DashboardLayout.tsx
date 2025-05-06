import Table, { Column, StatusBadge } from "@/ui/Table";
import Stats from "./Stats";

interface Project {
  projectName: string;
  company: string;
  startDate: string;
  technician: string;
  status: string;
}

function DashboardLayout() {
  const projects: Project[] = [
    {
      projectName: "Flood Damage",
      company: "Acme Inc.",
      startDate: "Nov 1, 2024",
      technician: "John Doe",
      status: "New",
    },
    {
      projectName: "Fire Damage",
      company: "Apple Industries",
      startDate: "Oct 30, 2024",
      technician: "Jane Smith",
      status: "New",
    },
    {
      projectName: "Flood Damage",
      company: "Acme Inc.",
      startDate: "Nov 1, 2024",
      technician: "Mike Johnson",
      status: "In Progress",
    },
    {
      projectName: "Mold Assessment",
      company: "TechCorp Ltd",
      startDate: "Oct 30, 2024",
      technician: "Sarah Lee",
      status: "In Progress",
    },
    {
      projectName: "Fire Damage",
      company: "Apple Industries",
      startDate: "Oct 30, 2024",
      technician: "Mike Johnson",
      status: "New",
    },
  ];

  const columns: Column<Project>[] = [
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

  return (
    <div className="flex flex-col space-y-6">
      <Stats />
      <Table columns={columns} data={projects} title="In Progress" />
      <Table columns={columns} data={projects} title="Awaiting PM Review" />
    </div>
  );
}

export default DashboardLayout;
