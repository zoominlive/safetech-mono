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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store";
import { formatDate } from "@/lib/utils";
import { LocationData } from "@/types/customer";
import { SearchInput } from "@/components/SearchInput";

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
  const { user } = useAuthStore();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState<{
    customerName: string;
    companyName: string;
    status: string;
    email: string;
    phoneNumber: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    province: string;
    postal_code: string;
    locations: LocationData[];
    projects: (Project & { companyName: string })[];
  }>({
    customerName: "",
    companyName: "",
    status: "",
    email: "",
    phoneNumber: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    province: "",
    postal_code: "",
    locations: [],
    projects: [],
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [status, setStatus] = useState<boolean>(id ? customerData.status === "active" : true);
  const [projectSearch, setProjectSearch] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<(Project & { companyName: string })[]>([]);

  // Fetch customer details when id changes
  useEffect(() => {
    if (id) {
      fetchCustomerDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Intentionally excluding fetchCustomerDetails to prevent dependency cycle

  useEffect(() => {
    if (id && customerData.status !== undefined && customerData.status !== null) {
      // Accept both boolean and string for status
      if (typeof customerData.status === "boolean") {
        setStatus(customerData.status);
      } else {
        setStatus(customerData.status === "active");
      }
    }
  }, [customerData.status, id]);

  useEffect(() => {
    // Filter projects whenever customerData.projects or projectSearch changes
    if (!projectSearch) {
      setFilteredProjects(customerData.projects);
    } else {
      const lower = projectSearch.toLowerCase();
      setFilteredProjects(
        customerData.projects.filter(
          (p) =>
            p.projectName?.toLowerCase().includes(lower) ||
            p.company?.toLowerCase().includes(lower) ||
            p.project_no?.toLowerCase().includes(lower) ||
            p.status?.toLowerCase().includes(lower)
        )
      );
    }
  }, [customerData.projects, projectSearch]);

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
            startDate: formatDate(project.start_date),
            status: project.status,
            company: customerName,
            endDate: formatDate(project.end_date), // Keeping end date null for now as requested
          })) || [];

        setCustomerData({
          customerName: customerName,
          companyName: response.data.company_name || "",
          status: response.data.status ? "active" : "inactive",
          email: response.data.email,
          phoneNumber: response.data.phone,
          address_line_1: response.data.address_line_1 || "",
          address_line_2: response.data.address_line_2 || "",
          city: response.data.city || "",
          province: response.data.province || "",
          postal_code: response.data.postal_code || "",
          projects: projectsWithCompany,  
          locations: response.data.locations || []
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
      navigate(`/projects/${project.id}/edit`);
    };
    
  // const openDeleteDialog = (project: Project) => {
  //   setProjectToDelete(project);
  //   setIsDeleteDialogOpen(true);
  // };
  
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
          
          <div className="flex items-center gap-4">
            {/* Only show status dropdown in Add mode or Edit mode */}
            {(!id || isEdit) && (
              <div className="flex items-center gap-2">
                <Label>Status</Label>
                <Select
                  value={status === true ? "active" : "inactive"}
                  onValueChange={(value) => setStatus(value === "active")}
                >
                  <SelectTrigger className="w-[120px] bg-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {id && !isEdit && user?.role !== "Technician" && (
              <Button
                className="bg-sf-secondary-300 text-black w-[150px] h-[48px]"
                onClick={() => setIsEdit(true)}
              >
                Edit <SquarePen />
              </Button>
            )}
          </div>
        </div>
        {isEdit && id ? (
          <CreateCustomerForm
            customerId={id}
            status={status}
            onStatusChange={setStatus}
            onCancel={() => {
              setIsEdit(false);
              fetchCustomerDetails();
            }}
          />
        ) : id && !isEdit ? (
          <CustomerDetails
            companyName={customerData.companyName}
            customerName={customerData.customerName}
            status={customerData.status}
            email={customerData.email}
            phoneNumber={customerData.phoneNumber}
            address_line_1={customerData.address_line_1}
            address_line_2={customerData.address_line_2}
            city={customerData.city}
            province={customerData.province}
            postal_code={customerData.postal_code}
            locations={customerData.locations}
          />
        ) : (
          <CreateCustomerForm status={status} onStatusChange={setStatus} />
        )}
      </div>
      {id && (
        <>
          <div className="mb-4 flex">
            <SearchInput
              placeholder="Search project"
              onSearch={setProjectSearch}
              className="max-w-md"
            />
          </div>
          <Table
            title="Projects"
            columns={columns}
            data={filteredProjects}
            hasActions={true}
            onDetails={handleDetails}
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
