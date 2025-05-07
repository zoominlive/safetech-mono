import Table, { Column, StatusBadge } from "@/ui/Table";
import { useNavigate } from "react-router";

interface Customer {
  id: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  status: string;
}

const customers: Customer[] = [
  {
    companyName: "Acme Inc.",
    email: "joh@example.com",
    phoneNumber: "1258489658",
    status: "active",
    id: "123",
  },
  {
    companyName: "Apple Inc.",
    email: "joh@example.com",
    phoneNumber: "1258489658",
    status: "inactive",
    id: "133",
  },
  {
    companyName: "Acme Inc.",
    email: "joh@example.com",
    phoneNumber: "1258489658",
    status: "active",
    id: "13",
  },
];

const columns: Column<Customer>[] = [
  {
    header: "Company Name",
    accessorKey: "companyName",
  },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Phone Number",
    accessorKey: "phoneNumber",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (customer) => <StatusBadge status={customer.status} />,
  },
];

export function CustomersTable() {
  const navigate = useNavigate();

  const handleDetails = (customer: Customer) => {
    navigate(`/customers/${customer.id}`);
  };
  return (
    <div>
      <Table
        columns={columns}
        data={customers}
        hasActions={true}
        onDetails={handleDetails}
        onDelete={(customer) => console.log("Delete", customer)}
        onEdit={(customer) => console.log("Edit", customer)}
        pagination={true}
      />
    </div>
  );
}
