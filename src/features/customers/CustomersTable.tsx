import Table, { Column, StatusBadge } from "@/ui/Table";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { customerService } from "@/services/api/customerService";
import { useAuthStore } from "@/store";

interface Customer {
  id: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  status: string;
}

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore.getState().token;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await customerService.getAllCustomers();
        
        if (response.success) {
          // Map API response to our Customer interface
          const mappedCustomers = response.data.rows.map(customer => ({
            id: customer.id.toString(),
            companyName: customer.name,
            email: customer.email,
            phoneNumber: customer.phone,
            status: customer.status === true ? 'active' : 'inactive', // Default to active if not provided by API
          }));
          
          setCustomers(mappedCustomers);
          setError(null);
        } else {
          setError(response.message || "Failed to load customers data");
        }
      } catch (err) {
        console.error("Error fetching customers data:", err);
        setError("Failed to load customers data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [token]);

  const handleDetails = (customer: Customer) => {
    navigate(`/customers/${customer.id}`);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading customers data...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

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
