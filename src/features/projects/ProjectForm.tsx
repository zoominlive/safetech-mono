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
import BackButton from "@/components/BackButton";
import { useAuthStore } from "@/store";
import { Combobox } from "@/components/Combobox";

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
}

interface Report {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [_technicians, setTechnicians] = useState<User[]>([]);
  const [_customers, setCustomers] = useState<Customer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [_reports, setReports] = useState<Report[]>([]);
  const [initialValues, setInitialValues] = useState<ProjectData>({
    name: "",
    company: {
      id: "",
      first_name: "",
      last_name: "",
    },
    technician: {
      id: "",
      first_name: "",
      last_name: "",
    },
    pm: {
      id: "",
      first_name: "",
      last_name: "",
    },
    location: {
      id: "",
      name: "",
    },
    site_name: "",
    site_email: "",
    site_contact_name: "",
    site_contact_title: "",
    status: "new",
    location_id: "",
    pm_id: "",
    report_template_id: "",
    reportTemplate: {
      id: "",
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
    site_contact_name: Yup.string().required("Site contact name is required"),
    site_contact_title: Yup.string().required("Site contact title is required"),
    customer_id: Yup.string().required("Customer is required"),
    technician_id: Yup.string().required("Technician is required"),
    site_email: Yup.string().email("Invalid email address"),
  });

  const fetchCustomers = async (query: string) => {
    const res = await customerService.getAllCustomers(query, undefined, undefined, 10, 1);
    if (res.success) {
      return res.data.rows.map((c: any) => ({ value: c.id, label: c.first_name + " " + c.last_name }));
    }
    return [];
  };
  const fetchReports = async () => {
    const res = await reportService.getAllReportTemplates();
    if (res.success) {
      return res.data.rows.map((r: any) => ({ value: r.id, label: r.name }));
    }
    return [];
  };
  const fetchTechnicians = async (query: string) => {
    const res = await userService.getAllUsers(query, undefined, undefined, 10, 1);
    if (res.success) {
      return res.data.rows.map((u: any) => ({ value: u.id, label: u.first_name + " " + u.last_name }));
    }
    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch technicians
        const usersResponse = await userService.getAllUsers();
        if (usersResponse.success) {
          setTechnicians(usersResponse.data.rows.map(user => ({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name
          })));
        }

        // Fetch customers
        const customersResponse = await customerService.getAllCustomers();
        if (customersResponse.success) {
          setCustomers(customersResponse.data.rows.map(customer => ({
            id: customer.id, 
            first_name: customer.first_name,
            last_name: customer.last_name
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
                first_name: projectDetails.company.first_name,
                last_name: projectDetails.company.last_name,
              },
              technician: {
                id: projectDetails.technician.id,
                first_name: projectDetails.technician.first_name,
                last_name: projectDetails.technician.last_name,
              },
              pm: {
                id: projectDetails.pm.id,
                first_name: projectDetails.pm.first_name,
                last_name: projectDetails.pm.last_name,
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
              site_contact_name: projectDetails.site_contact_name,
              site_contact_title: projectDetails.site_contact_title,
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
      // If user is Project Manager, set pm_id to their user id
      if (user && user.role && user.role.toLowerCase() === "project manager") {
        values.pm_id = user.id;
        values.pm = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
        }
      } else {
        values.pm_id = "1"; // fallback or default
      }
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
      <div className="flex items-center gap-4 mb-8">
        <BackButton/>
        <h2 className="font-semibold text-xl text-sf-black-300">
          {id ? "Edit Project" : "Add Project"}
        </h2>
      </div>
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
                  <Combobox
                    value={values.customer_id}
                    onChange={(val, option) => {
                      setFieldValue("customer_id", val);
                      if (option) setFieldValue("company", { id: option.value, name: option.label });
                    }}
                    fetchOptions={fetchCustomers}
                    placeholder="Select customer"
                  />
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
                  <Label htmlFor="site_contact_name">Contact Name</Label>
                  <Input
                    type="text"
                    id="site_contact_name"
                    name="site_contact_name"
                    placeholder="Enter site contact name"
                    className="py-7.5"
                    value={values.site_contact_name}
                    onChange={handleChange}
                  />
                  {errors.site_contact_name && touched.site_contact_name && (
                    <div className="text-red-500 text-sm">{errors.site_contact_name}</div>
                  )}
                </div>

                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="site_contact_title">Contact Title</Label>
                  <Input
                    type="text"
                    id="site_contact_title"
                    name="site_contact_title"
                    placeholder="Enter site contact title"
                    className="py-7.5"
                    value={values.site_contact_title}
                    onChange={handleChange}
                  />
                  {errors.site_contact_title && touched.site_contact_title && (
                    <div className="text-red-500 text-sm">{errors.site_contact_title}</div>
                  )}
                </div>

                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="report_template_id">Report Type</Label>
                  <Combobox
                    value={values.report_template_id}
                    onChange={(val, option) => {
                      setFieldValue("report_template_id", val);
                      if (option) setFieldValue("report", { id: option.value, name: option.label });
                    }}
                    fetchOptions={fetchReports}
                    placeholder="Select report type"
                  />
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
                  <Combobox
                    value={values.technician_id}
                    onChange={(val, option) => {
                      setFieldValue("technician_id", val);
                      if (option) setFieldValue("technician", { id: option.value, name: option.label });
                    }}
                    fetchOptions={fetchTechnicians}
                    placeholder="Select technician"
                  />
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
