import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";
import { Column } from "@/types/table";
import Table from "@/ui/Table";
import { SquarePen } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";
import CreateCustomerForm from "./CreateCustomerForm";
import CustomerDetails from "./CustomerDetails";

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

function CustomerLayout() {
  const { id } = useParams<{ id: string }>();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  return (
    <div className="space-y-9">
      <div className="space-y-7">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl">Customer Details</h2>
          {id && (
            <Button
              className="bg-sf-secondary-300 text-black w-[150px] h-[48px]"
              onClick={() => setIsEdit(!isEdit)}
            >
              Edit <SquarePen />
            </Button>
          )}
        </div>
        {isEdit && id ? (
          <CreateCustomerForm />
        ) : id && !isEdit ? (
          <CustomerDetails
            customerName="John Doe"
            status="active"
            email="john@example.com"
            phoneNumber="1234567890"
          />
        ) : (
          <CreateCustomerForm />
        )}
      </div>
      <Table title="Projects" columns={columns} data={[]} hasActions={true} />
    </div>
  );
}

export default CustomerLayout;
