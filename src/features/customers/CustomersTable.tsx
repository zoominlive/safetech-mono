import Table, { Column, StatusBadge } from "@/ui/Table";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { customerService } from "@/services/api/customerService";
import { useAuthStore } from "@/store";
import { toast } from "@/components/ui/use-toast";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
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

interface Customer {
  id: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  status: string;
}

interface CustomersTableProps {
  searchQuery?: string;
  sortBy?: string;
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

export function CustomersTable({ searchQuery, sortBy }: CustomersTableProps) {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const token = useAuthStore.getState().token;

  useEffect(() => {
    fetchCustomers();
  }, [token, searchQuery, sortBy]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await customerService.getAllCustomers(searchQuery, sortBy);
      
      if (response.success) {
        // Map API response to our Customer interface
        const mappedCustomers = response.data.rows.map(customer => ({
          id: customer.id.toString(),
          companyName: customer.name,
          email: customer.email,
          phoneNumber: customer.phone,
          status: customer.status === true ? 'active' : 'inactive',
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

  const handleDetails = (customer: Customer) => {
    navigate(`/customers/${customer.id}`);
  };
  
  const handleEdit = (customer: Customer) => {
    navigate(`/customers/${customer.id}/edit`);
  };
  
  const openDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!customerToDelete) return;
    
    try {
      setIsLoading(true);
      const response = await customerService.deleteCustomer(customerToDelete.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Customer deleted successfully",
        });
        fetchCustomers();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete customer",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error deleting customer:", err);      
      const errorMessage = err?.data?.message ||
        err.message ||
        "Failed to delete customer";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  if (isLoading && customers.length === 0) {
    return <TableSkeleton columns={4} rows={5} hasActions={true} />;
  }

  if (error && customers.length === 0) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <>
      <div>
        <Table
          columns={columns}
          data={customers}
          hasActions={true}
          onDetails={handleDetails}
          onDelete={openDeleteDialog}
          onEdit={handleEdit}
          pagination={true}
        />
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {customerToDelete?.companyName} and remove their data from our servers.
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
