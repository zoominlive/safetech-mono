import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";
import { Column } from "@/types/table";
import Table from "@/ui/Table";
import { SquarePen } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import CreateCustomerForm from "./CreateCustomerForm";
import CustomerDetails from "./CustomerDetails";
import { customerService } from "@/services/api/customerService";
import { toast } from "@/components/ui/use-toast";
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [loading, setLoading] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState({
    customerName: "",
    status: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (id) {
      fetchCustomerDetails();
    }
  }, [id]);

  const fetchCustomerDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await customerService.getCustomerById(id);
      
      if (response.success) {
        setCustomerData({
          customerName: response.data.name,
          status: response.data.status ? "active" : "inactive",
          email: response.data.email,
          phoneNumber: response.data.phone,
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load customer data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="space-y-9">
        <div className="space-y-7">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-xl">Customer Details</h2>
            <Skeleton className="w-[150px] h-[48px]" />
          </div>
          <CardSkeleton rows={2} columns={2} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-9">
      <div className="space-y-7">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl">
            {id ? "Customer Details" : "Add New Customer"}
          </h2>
          {id && !isEdit && (
            <Button
              className="bg-sf-secondary-300 text-black w-[150px] h-[48px]"
              onClick={() => setIsEdit(true)}
            >
              Edit <SquarePen />
            </Button>
          )}
        </div>
        {isEdit && id ? (
          <CreateCustomerForm 
            customerId={id} 
            onCancel={() => {
              setIsEdit(false);
              fetchCustomerDetails();
            }}
          />
        ) : id && !isEdit ? (
          <CustomerDetails
            customerName={customerData.customerName}
            status={customerData.status}
            email={customerData.email}
            phoneNumber={customerData.phoneNumber}
          />
        ) : (
          <CreateCustomerForm />
        )}
      </div>
      {id && (
        <Table 
          title="Projects" 
          columns={columns} 
          data={[]} 
          hasActions={true}
        />
      )}
    </div>
  );
}

export default CustomerLayout;
