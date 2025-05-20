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
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";

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
  const [initialValues, setInitialValues] = useState<ProjectData>({
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
    report_template_id: "",
    reportTemplate: {
      id: 1,
      name: ""
    },
    technician_id: "",
    customer_id: "",
    start_date: "",
  });

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Project name is required"),
    site_name: Yup.string().required("Site name is required"),
    customer_id: Yup.string().required("Customer is required"),
    technician_id: Yup.string().required("Technician is required"),
    site_email: Yup.string().email("Invalid email address"),
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
        const reportsResponse = await reportService.getAllReportTemplates();
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
            
            setInitialValues({
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
              reportTemplate: {
                id: projectDetails.reportTemplate.id,
                name: projectDetails.reportTemplate.name,
              },
              location: {
                id: projectDetails.location.id,
                name: projectDetails.location.name,
              },
              site_name: projectDetails.site_name,
              site_email: projectDetails.site_email,
              status: projectDetails.status,
              location_id: projectDetails.location_id,
              report_template_id: projectDetails.report_template_id,
              pm_id: projectDetails.pm_id,
              technician_id: projectDetails.technician_id,
              customer_id: projectDetails.customer_id,
              start_date: projectDetails.start_date,
            });
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

  const handleSubmit = async (values: ProjectData, { setSubmitting }: FormikHelpers<ProjectData>) => {
    try {
      setIsLoading(true);
      values.pm_id = "1"; // Assuming PM ID is always 1 for now
      const response = id
        ? await projectService.updateProject(id, values)
        : await projectService.createProject(values);
      
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
      setSubmitting(false);
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
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, setFieldValue, isSubmitting }) => (
          <Form>
            <Card>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-14 h-[calc(100vh-350px)] overflow-y-auto pt-6">
                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="customer_id">Customer *</Label>
                  <Select 
                    value={values.customer_id?.toString()} 
                    onValueChange={(value) => {
                      setFieldValue("customer_id", value);
                      const selectedCustomer = customers.find(c => c.id.toString() === value);
                      if (selectedCustomer) {
                        setFieldValue("company", {
                          id: selectedCustomer.id,
                          name: selectedCustomer.name
                        });
                      }
                    }}
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
                  {errors.customer_id && touched.customer_id && (
                    <div className="text-red-500 text-sm">{errors.customer_id}</div>
                  )}
                </div>

                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter project name"
                    className="py-7.5"
                    value={values.name}
                    onChange={handleChange}
                  />
                  {errors.name && touched.name && (
                    <div className="text-red-500 text-sm">{errors.name}</div>
                  )}
                </div>

                <div className="grid w-full gap-3 col-span-2">
                  <Label htmlFor="location_id">Location</Label>
                  <Select 
                    value={values.location_id?.toString()} 
                    onValueChange={(value) => {
                      setFieldValue("location_id", value);
                      const selectedLocation = locations.find(l => l.id.toString() === value);
                      if (selectedLocation) {
                        setFieldValue("location", {
                          id: selectedLocation.id,
                          name: selectedLocation.name
                        });
                      }
                    }}
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
                  <Label htmlFor="site_name">Site Name *</Label>
                  <Input
                    type="text"
                    id="site_name"
                    name="site_name"
                    placeholder="Enter site name"
                    className="py-7.5"
                    value={values.site_name}
                    onChange={handleChange}
                  />
                  {errors.site_name && touched.site_name && (
                    <div className="text-red-500 text-sm">{errors.site_name}</div>
                  )}
                </div>

                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="site_email">Site Email</Label>
                  <Input
                    type="email"
                    id="site_email"
                    name="site_email"
                    placeholder="Enter site email"
                    className="py-7.5"
                    value={values.site_email}
                    onChange={handleChange}
                  />
                  {errors.site_email && touched.site_email && (
                    <div className="text-red-500 text-sm">{errors.site_email}</div>
                  )}
                </div>

                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="report_template_id">Report Type</Label>
                  <Select 
                    value={values.report_template_id?.toString()} 
                    onValueChange={(value) => {
                      setFieldValue("report_template_id", value);
                      const selectedReport = reports.find(r => r.id.toString() === value);
                      if (selectedReport) {
                        setFieldValue("report", {
                          id: selectedReport.id,
                          name: selectedReport.name
                        });
                      }
                    }}
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
                  <Label htmlFor="start_date">Start Date</Label>
                  <DatePicker 
                    date={values.start_date ? new Date(values.start_date) : undefined} 
                    setDate={(date) => {
                      if (date) {
                        setFieldValue("start_date", date.toISOString().split('T')[0]);
                      }
                    }}
                    className="py-7.5"
                  />
                </div>

                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="technician_id">Technician *</Label>
                  <Select 
                    value={values.technician_id?.toString()} 
                    onValueChange={(value) => {
                      setFieldValue("technician_id", value);
                      const selectedTechnician = technicians.find(t => t.id.toString() === value);
                      if (selectedTechnician) {
                        setFieldValue("technician", {
                          id: selectedTechnician.id,
                          name: selectedTechnician.name
                        });
                      }
                    }}
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
                  {errors.technician_id && touched.technician_id && (
                    <div className="text-red-500 text-sm">{errors.technician_id}</div>
                  )}
                </div>

                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={values.status.toLowerCase()} 
                    onValueChange={(value) => setFieldValue("status", value)}
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
                type="submit"
                className="bg-sf-gray-600 text-white w-[150px] h-[48px]"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? "Saving..." : "Save"} <Bookmark />
              </Button>
              <Button 
                type="button"
                className="bg-sf-secondary text-black w-[150px] h-[48px]"
                onClick={handleCancel}
                disabled={isSubmitting || isLoading}
              >
                Cancel <CircleX />
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProjectForm;
