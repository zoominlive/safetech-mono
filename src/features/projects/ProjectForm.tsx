import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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

interface SelectOption {
  value: string;
  label: string;
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
  const [projectNumber, setProjectNumber] = useState<string>("");

  // Generate a random 5-digit number
  const generateProjectNumber = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  useEffect(() => {
    if (!id) {
      // Generate new project number only for new projects
      setProjectNumber(generateProjectNumber());
    }
  }, [id]);

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
    end_date: "",
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

  const fetchCustomers = async (query: string, selectedId?: string) => {
    const res = await customerService.getAllCustomers(query, undefined, undefined, 10, 1);
    let options:SelectOption[] = [];
    if (res.success) {
      options = res.data.rows.map((c: any) => ({ value: c.id, label: c.first_name + " " + c.last_name }));
    }
    // If in edit mode and selectedId is not in options, fetch and append
    if (selectedId && !options.some((opt) => opt.value === selectedId)) {
      try {
      const singleRes: { success: boolean; data: Customer } = await customerService.getCustomerById(selectedId);
      if (singleRes.success) {
        const c: Customer = singleRes.data;
        options.push({ value: c.id, label: c.first_name + " " + c.last_name });
      }
      } catch (e: unknown) {
      // ignore error
      }
    }
    return options;
  };
  const fetchReports = async () => {
    const res = await reportService.getAllActiveReportTemplates();
    if (res.success) {
      return res.data.rows.map((r: any) => ({ value: r.id, label: r.name }));
    }
    return [];
  };
  const fetchTechnicians = async (query: string, selectedId?: string) => {
    const res = await userService.getAllUsers(query, undefined, undefined, 10, 1, "technician");    
    let options: SelectOption[] = [];
    if (res.success) {
      options = res.data.rows.map((u: any) => ({ value: u.id, label: u.first_name + " " + u.last_name }));
    }
    // If in edit mode and selectedId is not in options, fetch and append
    if (selectedId && !options.some(opt => opt.value === selectedId)) {
      try {
        const singleRes = await userService.getUserById(selectedId);
        if (singleRes.success) {
          const u = singleRes.data;
          options.push({ value: u.id, label: u.first_name + " " + u.last_name });
        }
      } catch (e) {
        // ignore error
      }
    }
    return options;
  };

  // Fetch locations by customer id
  const fetchLocationsByCustomer = async (custId: string) => {
    if (!custId) {
      setLocations([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await locationService.getLocationsByCustomerId(custId);
      console.log("Locations Response::", res);
      
      if (res.success) {
        setLocations(res.data.map((location: any) => ({
          id: location.id,
          name: location.name
        })));
      } else {
        setLocations([]);
      }
    } catch (e) {
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
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
        const reportsResponse = await reportService.getAllActiveReportTemplates();
        if (reportsResponse.success) {
          setReports(reportsResponse.data.rows.map(report => ({
            id: report.id,
            name: report.name
          })));
        }

        // Fetch locations
        if (id && initialValues.customer_id) {
          await fetchLocationsByCustomer(initialValues.customer_id);
        } else {
          const locationsResponse = await locationService.getAllLocations();
          if (locationsResponse.success) {
            setLocations(locationsResponse.data.map(location => ({
              id: location.id,
              name: location.name
            })));
          }
        }

        // If editing, fetch project data
        console.log("Project ID::", id);
        
        if (id) {
          const projectResponse = await projectService.getProjectById(id);
          if (projectResponse.success) {
            const projectDetails = projectResponse.data;
            console.log("Project Details::", projectDetails);
            
            setProjectNumber(projectDetails.project_no || ""); // Set project number from API
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
              end_date: projectDetails.end_date,
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
  }, [id, initialValues.customer_id]);

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

      // Add project number for new projects
      if (!id) {
        values.project_number = projectNumber;
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
        <div>
          <h2 className="font-semibold text-xl text-sf-black-300">
            {id ? "Edit Project" : "Add Project"}
          </h2>
          {projectNumber && (
            <p className="text-sm text-gray-500 mt-1">
              Project Number: {projectNumber}
            </p>
          )}
        </div>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, setFieldValue, isSubmitting }) => (
          <Form>
            <Card className="py-0">
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 pt-6">
                <div className="grid w-full items-center gap-3 relative">
                  <Label htmlFor="customer_id">Customer *</Label>
                  <Combobox
                    value={values.customer_id}
                    onChange={async (val, option) => {
                      setFieldValue("customer_id", val);
                      if (option) setFieldValue("company", { id: option.value, name: option.label });
                      await fetchLocationsByCustomer(val ? String(val) : "");
                      setFieldValue("location_id", "");
                      setFieldValue("location", { id: "", name: "" });
                    }}
                    fetchOptions={(q) => fetchCustomers(q, values.customer_id)}
                    placeholder="Select customer"
                  />
                  <div className="min-h-[20px] relative">
                    {errors.customer_id && touched.customer_id && (
                      <div className="text-red-500 text-sm absolute left-0 top-0">{errors.customer_id}</div>
                    )}
                  </div>
                </div>

                <div className="grid w-full items-center gap-3 relative">
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
                  <div className="min-h-[20px] relative">
                    {errors.name && touched.name && (
                      <div className="text-red-500 text-sm absolute left-0 top-0">{errors.name}</div>
                    )}
                  </div>
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
                        {!values.customer_id ? (
                          <div className="text-center text-gray-500 py-2">
                            Please select a customer first
                          </div>
                        ) : locations.length === 0 ? (
                          <div className="text-center text-gray-500 py-2">
                            {(() => {
                              const selectedCustomer = _customers.find(c => c.id === values.customer_id);
                              return `No Data Found for ${selectedCustomer ? selectedCustomer.first_name + ' ' + selectedCustomer.last_name : 'this customer'}`;
                            })()}
                          </div>
                        ) : (
                          locations.map((location) => (
                            <SelectItem key={location.id} value={location.id.toString()}>
                              {location.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full items-center gap-3 relative">
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
                  <div className="min-h-[20px] relative">
                    {errors.site_name && touched.site_name && (
                      <div className="text-red-500 text-sm absolute left-0 top-0">{errors.site_name}</div>
                    )}
                  </div>
                </div>
                
                <div className="grid w-full items-center gap-3 relative">
                  
                </div>

                <div className="grid w-full items-center gap-3 relative">
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
                  <div className="min-h-[20px] relative">
                    {errors.site_contact_name && touched.site_contact_name && (
                      <div className="text-red-500 text-sm absolute left-0 top-0">{errors.site_contact_name}</div>
                    )}
                  </div>
                </div>

                <div className="grid w-full items-center gap-3 relative">
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
                  <div className="min-h-[20px] relative">
                    {errors.site_contact_title && touched.site_contact_title && (
                      <div className="text-red-500 text-sm absolute left-0 top-0">{errors.site_contact_title}</div>
                    )}
                  </div>
                </div>

                <div className="grid w-full items-center gap-3 relative">
                  <Label htmlFor="site_email">Contact Email</Label>
                  <Input
                    type="email"
                    id="site_email"
                    name="site_email"
                    placeholder="Enter contact email"
                    className="py-7.5"
                    value={values.site_email}
                    onChange={handleChange}
                  />
                  <div className="min-h-[20px] relative">
                    {errors.site_email && touched.site_email && (
                      <div className="text-red-500 text-sm absolute left-0 top-0">{errors.site_email}</div>
                    )}
                  </div>
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
                  <div className="min-h-[20px] relative">
                    {errors.report_template_id && touched.report_template_id && (
                      <div className="text-red-500 text-sm absolute left-0 top-0">{errors.report_template_id}</div>
                    )}
                  </div>
                </div>

                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="start_date">Scheduled Start Date</Label>
                  <DatePicker 
                    date={values.start_date ? new Date(values.start_date) : undefined} 
                    setDate={(date) => {
                      if (date) {
                        setFieldValue("start_date", date.toISOString().split('T')[0]);
                      }
                    }}
                  />
                  <div className="min-h-[20px] relative">
                    {errors.start_date && touched.start_date && (
                      <div className="text-red-500 text-sm absolute left-0 top-0">{errors.start_date}</div>
                    )}
                  </div>
                </div>

                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="end_date">Expected End Date</Label>
                  <DatePicker 
                    date={values.end_date ? new Date(values.end_date) : undefined} 
                    setDate={(date) => {
                      if (date) {
                        setFieldValue("end_date", date.toISOString().split('T')[0]);
                      }
                    }}
                  />
                  <div className="min-h-[20px] relative">
                    {errors.start_date && touched.start_date && (
                      <div className="text-red-500 text-sm absolute left-0 top-0">{errors.start_date}</div>
                    )}
                  </div>
                </div>

                <div className="grid w-full items-center gap-3 relative">
                  <Label htmlFor="technician_id">Technician *</Label>
                  <Combobox
                    value={values.technician_id}
                    onChange={(val, option) => {
                      setFieldValue("technician_id", val);
                      if (option) setFieldValue("technician", { id: option.value, name: option.label });
                    }}
                    fetchOptions={(q) => fetchTechnicians(q, values.technician_id)}
                    placeholder="Select technician"
                  />
                  <div className="min-h-[20px] relative">
                    {errors.technician_id && touched.technician_id && (
                      <div className="text-red-500 text-sm absolute left-0 top-0">{errors.technician_id}</div>
                    )}
                  </div>
                </div>

                {/* <div className="grid w-full items-center gap-3">
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
                  <div className="min-h-[20px] relative">
                  </div>
                </div> */}
              </CardContent>
              <CardFooter className="flex justify-end space-x-6 pb-6">
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
              </CardFooter>
            </Card>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProjectForm;
