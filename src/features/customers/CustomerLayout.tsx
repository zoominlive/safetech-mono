import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";
import { Column } from "@/types/table";
import Table from "@/ui/Table";
import { SquarePen } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import CreateCustomerForm from "./CreateCustomerForm";
import CustomerDetails from "./CustomerDetails";
import { customerService } from "@/services/api/customerService";
import { toast } from "@/components/ui/use-toast";
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { projectService } from "@/services/api/projectService";
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
import BackButton from "@/components/BackButton";

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
    header: "End Date",
    accessorKey: "endDate",
  },
  {
    header: "Status",
    accessorKey: "status",
  },
];

function CustomerLayout() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState({
    customerName: "",
    status: "",
    email: "",
    phoneNumber: "",
    location_name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    province: "",
    postal_code: "",
    projects: [] as (Project & { companyName: string })[],
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

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
        const customerName = response.data.first_name + " " + response.data.last_name;
        // Add companyName to each project
        const projectsWithCompany =
          response.data.projects?.map((project: any) => ({
            ...project,
            projectName: project.name,
            startDate: project.start_date,
            status: project.status,
            company: customerName,
            endDate: null, // Keeping end date null for now as requested
          })) || [];

        setCustomerData({
          customerName: customerName,
          status: response.data.status ? "active" : "inactive",
          email: response.data.email,
          phoneNumber: response.data.phone,
          location_name: response.data.location_name || "",
          address_line_1: response.data.address_line_1 || "",
          address_line_2: response.data.address_line_2 || "",
          city: response.data.city || "",
          province: response.data.province || "",
          postal_code: response.data.postal_code || "",
          projects: projectsWithCompany,  
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

  const handleDetails = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleEdit = (project: Project) => {
      navigate(`/staff/${project.id}/edit`);
    };
    
  const openDeleteDialog = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      setLoading(true);
      const response = await projectService.deleteProject(projectToDelete.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchCustomerDetails();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error deleting user:", err);      
      const errorMessage = err?.data?.message ||
        err.message ||
        "Failed to delete user";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
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
          <div className="flex items-center gap-4">
            <BackButton/>
            <h2 className="font-semibold text-xl">
              {id ? "Customer Details" : "Add New Customer"}
            </h2>
          </div>
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
            location_name={customerData.location_name}
            address_line_1={customerData.address_line_1}
            address_line_2={customerData.address_line_2}
            city={customerData.city}
            province={customerData.province}
            postal_code={customerData.postal_code}
          />
        ) : (
          <CreateCustomerForm />
        )}
      </div>
      {id && (
        <>
          <Table
            title="Projects"
            columns={columns}
            data={customerData.projects}
            hasActions={true}
            onDetails={handleDetails}
            onDelete={openDeleteDialog}
            onEdit={handleEdit}
          />
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {projectToDelete?.projectName}'s account and remove their data from our servers.
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
      )}
    </div>
  );
}

export default CustomerLayout;
