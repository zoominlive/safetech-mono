import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/ui/Table";

function ProjectTable() {
  const projects = [
    {
      id: "728ed52f",
      projectName: "Flood Damage",
      companyName: "Acme Inc",
      startDate: new Date(),
      technician: "John Doe",
      status: "new",
    },
    {
      id: "62309df2",
      projectName: "Fire Assessment",
      companyName: "Tech Solutions",
      startDate: new Date(),
      technician: "Jane Smith",
      status: "in progress",
    },
    {
      id: "91ef35a8",
      projectName: "Mold Remediation",
      companyName: "Global Corp",
      startDate: new Date(),
      technician: "Mike Wilson",
      status: "completed",
    },
  ];

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-safetech-gray h-[70px]">
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead className="hidden sm:table-cell">Start Date</TableHead>
              <TableHead className="hidden md:table-cell">Technician</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">
                  {project.projectName}
                </TableCell>
                <TableCell>{project.companyName}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {project.startDate.toLocaleDateString()}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {project.technician}
                </TableCell>
                <TableCell>
                  <StatusBadge status={project.status} />
                </TableCell>
                <TableCell>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs py-1 px-3 rounded transition-colors">
                    View
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ProjectTable;
