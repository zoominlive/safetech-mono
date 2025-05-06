import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  ];

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-safetech-gray h-[70px]">
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Company Name</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">
                {project.projectName}
              </TableCell>
              <TableCell>{project.companyName}</TableCell>
              <TableCell>{project.startDate.toLocaleDateString()}</TableCell>
              <TableCell>{project.technician}</TableCell>
              <TableCell>{project.status}</TableCell>
              <TableCell>btn</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default ProjectTable;
