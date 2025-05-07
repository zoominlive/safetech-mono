import CreateCustomerForm from "@/features/customers/CreateCustomerForm";
import { Project } from "@/types/project";
import { Column } from "@/types/table";
import Table from "@/ui/Table";

const columns: Column<Project>[] = [
  {
    header: "Project Name",
    accessorKey: "projectName",
  },
  {
    header: "Company",
    accessorKey: "projectName",
  },
  {
    header: "Start Date",
    accessorKey: "projectName",
  },
  {
    header: "End Date",
    accessorKey: "projectName",
  },
  {
    header: "Status",
    accessorKey: "projectName",
  },
];

function Customer() {
  return (
    <div className="space-y-9">
      <CreateCustomerForm />
      <Table title="Projects" columns={columns} data={[]} hasActions={true} />
    </div>
  );
}

export default Customer;
