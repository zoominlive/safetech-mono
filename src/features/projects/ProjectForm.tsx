import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Bookmark, CircleX } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ProjectData, projectService } from "@/services/api/projectService";
import { toast } from "@/components/ui/use-toast";
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import { userService } from "@/services/api/userService";
import { customerService } from "@/services/api/customerService";
import { reportService } from "@/services/api/reportService";
import { locationService } from "@/services/api/locationService";
import { DatePicker } from "@/components/ui/date-picker";

interface User {
  id: number;
  name: string;
}

interface Customer {
  id: number;
  name: string;
}

interface Report {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);

  const [projectData, setProjectData] = useState<ProjectData>({
    name: "",
    company: {
      id: 1,
      name: "",
    },
    technician: {
      id: 1,
      name: ""
    },
    pm: {
      id: 1,
      name: "",
    },
    location: {
      id: 1,
      name: "",
    },
    site_name: "",
    site_email: "",
    status: "new",
    location_id: "",
    pm_id: "",
    report_id: "",
    report: {
      id: 1,
      name: ""
    },
    technician_id: "",
    customer_id: "",
    start_date: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch technicians
        const usersResponse = await userService.getAllUsers();
        if (usersResponse.success) {
          setTechnicians(usersResponse.data.rows.map(user => ({
            id: user.id,
            name: user.name
          })));
        }

        // Fetch customers
        const customersResponse = await customerService.getAllCustomers();
        if (customersResponse.success) {
          setCustomers(customersResponse.data.rows.map(customer => ({
            id: customer.id, 
            name: customer.name
          })));
        }

        // Fetch reports
        const reportsResponse = await reportService.getAllReports();
        if (reportsResponse.success) {
          setReports(reportsResponse.data.rows.map(report => ({
            id: report.id,
            name: report.name
          })));
        }

        // Fetch locations
        const locationsResponse = await locationService.getAllLocations();
        if (locationsResponse.success) {
          setLocations(locationsResponse.data.map(location => ({
            id: location.id,
            name: location.name
          })));
        }

        // If editing, fetch project data
        console.log("Project ID::", id);
        
        if (id) {
          const projectResponse = await projectService.getProjectById(id);
          if (projectResponse.success) {
            const projectDetails = projectResponse.data;
            console.log("Project Details::", projectDetails);
            
            setProjectData({
              name: projectDetails.name,
              company: {
                id: projectDetails.company.id,
                name: projectDetails.company.name,
              },
              technician: {
                id: projectDetails.technician.id,
                name: projectDetails.technician.name,
              },
              pm: {
                id: projectDetails.pm.id,
                name: projectDetails.pm.name,
              },
              report: {
                id: projectDetails.report.id,
                name: projectDetails.report.name,
              },
              location: {
                id: projectDetails.location.id,
                name: projectDetails.location.name,
              },
              site_name: projectDetails.site_name,
              site_email: projectDetails.site_email,
              status: projectDetails.status,
              location_id: projectDetails.location_id,
              report_id: projectDetails.report_id,
              pm_id: projectDetails.pm_id,
              technician_id: projectDetails.technician_id,
              customer_id: projectDetails.customer_id,
              start_date: projectDetails.start_date,
            });

            if (projectDetails.start_date) {
              setStartDate(new Date(projectDetails.start_date));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (field: keyof ProjectData, value: string) => {
    setProjectData((prev) => {
      // Create a new state object
      const newState = { ...prev, [field]: value };
      newState.pm_id = "1";
      // Handle special cases for dropdown fields
      switch (field) {
        case "customer_id":
          {
            const selectedCustomer = customers.find(c => c.id.toString() === value);
            if (selectedCustomer) {
              newState.company = {
                id: selectedCustomer.id,
                name: selectedCustomer.name
              };
            }
            break;
          }
        
        case "technician_id":
          {
            const selectedTechnician = technicians.find(t => t.id.toString() === value);
            if (selectedTechnician) {
              newState.technician = {
                id: selectedTechnician.id,
                name: selectedTechnician.name
              };
            }
            break;
          }
        
        case "pm_id":
          {
            const selectedPM = technicians.find(t => t.id.toString() === value);
            if (selectedPM) {
              newState.pm = {
                id: selectedPM.id,
                name: selectedPM.name
              };
            }
            break;
          }
        
        case "report_id":
          {
            const selectedReport = reports.find(r => r.id.toString() === value);
            if (selectedReport) {
              newState.report = {
                id: selectedReport.id,
                name: selectedReport.name
              };
            }
            break;
          }
        
        case "location_id":
          {
            const selectedLocation = locations.find(l => l.id.toString() === value);
            if (selectedLocation) {
              newState.location = {
                id: selectedLocation.id,
                name: selectedLocation.name
              };
            }
            break;
          }
      }
      
      return newState;
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      setProjectData((prev) => ({
        ...prev,
        start_date: date.toISOString().split('T')[0]
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      const requiredFields = ['name', 'site_name', 'customer_id', 'technician_id'];
      const missingFields = requiredFields.filter(field => !projectData[field as keyof ProjectData]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const response = id
        ? await projectService.updateProject(id, projectData)
        : await projectService.createProject(projectData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: id ? "Project updated successfully" : "Project created successfully",
        });
        navigate("/projects");
      } else {
        toast({
          title: "Error",
          description: response.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: "Failed to save project data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/projects");
  };

  if (isLoading && id) {
    return <CardSkeleton rows={6} columns={2} withFooter={true} />;
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="font-semibold text-xl text-sf-black-300 mb-8">
        {id ? "Edit Project" : "Add Project"}
      </h2>
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-14 h-[calc(100vh-350px)] overflow-y-auto pt-6">
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="customer">Customer *</Label>
            <Select 
              value={projectData.company.id.toString()} 
              onValueChange={(value) => handleChange("customer_id", value)}
            >
              <SelectTrigger className="w-full py-7.5">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="projectName">Project Name *</Label>
            <Input
              type="text"
              id="projectName"
              placeholder="Enter project name"
              className="py-7.5"
              value={projectData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="grid w-full gap-3 col-span-2">
            <Label htmlFor="location">Location</Label>
            <Select 
              value={projectData.location.id.toString()} 
              onValueChange={(value) => handleChange("location_id", value)}
            >
              <SelectTrigger className="w-full py-7.5">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="contactName">Site Name *</Label>
            <Input
              type="text"
              id="siteName"
              placeholder="Enter site name"
              className="py-7.5"
              value={projectData.site_name}
              onChange={(e) => handleChange("site_name", e.target.value)}
            />
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="contactEmail">Site Email</Label>
            <Input
              type="email"
              id="siteEmail"
              placeholder="Enter site email"
              className="py-7.5"
              value={projectData.site_email}
              onChange={(e) => handleChange("site_email", e.target.value)}
            />
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="reportType">Report Type</Label>
            <Select 
              value={projectData.report.id.toString()} 
              onValueChange={(value) => handleChange("report_id", value)}
            >
              <SelectTrigger className="w-full py-7.5">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {reports.map((report) => (
                    <SelectItem key={report.id} value={report.id.toString()}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="startDate">Start Date</Label>
            <DatePicker 
              date={startDate} 
              setDate={handleDateChange}
              className="py-7.5"
            />
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="technician">Technician *</Label>
            <Select 
              value={projectData.technician.id.toString()} 
              onValueChange={(value) => handleChange("technician_id", value)}
            >
              <SelectTrigger className="w-full py-7.5">
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {technicians.map((technician) => (
                    <SelectItem key={technician.id} value={technician.id.toString()}>
                      {technician.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={projectData.status} 
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger className="w-full py-7.5">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on hold">On Hold</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <div className="text-end bg-white py-5 pe-8 space-x-6 absolute bottom-0 w-full left-0">
        <Button 
          className="bg-sf-gray-600 text-white w-[150px] h-[48px]"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"} <Bookmark />
        </Button>
        <Button 
          className="bg-sf-secondary text-black w-[150px] h-[48px]"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel <CircleX />
        </Button>
      </div>
    </div>
  );
};

export default ProjectForm;
