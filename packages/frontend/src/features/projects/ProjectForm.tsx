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
import { Bookmark, CircleX, Download, SquarePen, Trash2 } from "lucide-react";
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
import { MultiSelect, Option } from "@/components/MultiSelect";
import { projectDrawingService, ProjectDrawing } from "@/services/api/projectDrawingService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface Customer {
  id: string;
  company_name: string;
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
  address_line_1: string;
  address_line_2: string;
  city: string;
  province: string;
  postal_code: string;
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
  const [projectManagers, setProjectManagers] = useState<User[]>([]);
  const [drawings, setDrawings] = useState<ProjectDrawing[]>([]);
  const [isLoadingDrawings, setIsLoadingDrawings] = useState(false);
  const [isUploadingUnmarked, setIsUploadingUnmarked] = useState(false);
  const [isUploadingMarked, setIsUploadingMarked] = useState(false);

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

  useEffect(() => {
    const loadDrawings = async () => {
      if (!id) return;
      try {
        setIsLoadingDrawings(true);
        const res = await projectDrawingService.list(id);
        if (res.success) setDrawings(res.data);
      } catch (e) {
        // ignore and show empty
      } finally {
        setIsLoadingDrawings(false);
      }
    };
    loadDrawings();
  }, [id]);

  const refreshDrawings = async () => {
    if (!id) return;
    const res = await projectDrawingService.list(id);
    if (res.success) setDrawings(res.data);
  };

  const handleUpload = async (files: FileList | null, isMarked: boolean) => {
    if (!files || files.length === 0) {
      toast({ title: "No files selected", description: "Please choose at least one file to upload.", variant: "destructive" });
      return;
    }
    if (!id) return;
    try {
      if (isMarked) setIsUploadingMarked(true); else setIsUploadingUnmarked(true);
      const fileArray = Array.from(files);
      toast({ title: "Preparing upload", description: `${fileArray.length} file(s) selected` });
      await projectDrawingService.upload(id, fileArray, isMarked);
      toast({ title: "Uploaded", description: `${files.length} file(s) uploaded` });
      await refreshDrawings();
    } catch (e) {
      toast({ title: "Error", description: "Failed to upload drawings", variant: "destructive" });
    } finally {
      if (isMarked) setIsUploadingMarked(false); else setIsUploadingUnmarked(false);
    }
  };

  const handleDelete = async (drawingId: string) => {
    if (!id) return;
    try {
      const res = await projectDrawingService.remove(id, drawingId);
      if (res?.success) {
        toast({ title: "Deleted", description: "Drawing removed" });
        await refreshDrawings();
      } else {
        toast({ title: "Error", description: res?.message || "Failed to delete drawing", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete drawing", variant: "destructive" });
    }
  };

  const unmarkedDrawings = drawings.filter(d => !d.is_marked);
  const markedDrawings = drawings.filter(d => d.is_marked);

  const [initialValues, setInitialValues] = useState<ProjectData>({
    name: "",
    company: {
      id: "",
      company_name: "",
      first_name: "",
      last_name: "",
    },
    technicians: [],
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
    specific_location: "",
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
    technician_ids: [],
    customer_id: "",
    start_date: "",
    end_date: "",
    report_id: "",
    project_type: "",
  });

  // Form validation schema
  const getValidationSchema = (userRole?: string) =>
    Yup.object({
      name: Yup.string().required("Project name is required"),
      // site_name: Yup.string().required("Site name is required"),
      specific_location: Yup.string().required("Specific Location is required"),
      site_contact_name: Yup.string().required("Site contact name is required"),
      site_contact_title: Yup.string().required("Site contact title is required"),
      customer_id: Yup.string().required("Customer is required"),
      location_id: Yup.string().required("Location is required"),
      technician_ids: Yup.array().min(1, "At least one technician is required"),
      site_email: Yup.string().email("Invalid email address"),
      pm_id:
        userRole && userRole.toLowerCase() === "admin"
          ? Yup.string().required("Project Manager is required")
          : Yup.string(),
    });

  const fetchCustomers = async (query: string, selectedId?: string) => {
    // If query is empty, fetch initial set of customers (50 records)
    // If query exists, search with that term (100 records for better search results)
    const limit = query.trim() ? 100 : 50;
    const res = await customerService.getAllCustomers(query, undefined, undefined, limit, 1);
    let options: SelectOption[] = [];
    
    if (res.success) {
      options = res.data.rows.map((c: any) => ({ 
        value: c.id, 
        label: c.company_name 
      }));
    }
    
    // If in edit mode and selectedId is not in options, fetch and append
    if (selectedId && !options.some((opt) => opt.value === selectedId)) {
      try {
        const singleRes: { success: boolean; data: Customer } = await customerService.getCustomerById(selectedId);
        if (singleRes.success) {
          const c: Customer = singleRes.data;
          options.push({ value: c.id, label: c.company_name });
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
  // const fetchTechnicians = async (query: string, selectedId?: string) => {
  //   const res = await userService.getAllUsers(query, undefined, undefined, 10, 1, "technician");    
  //   let options: SelectOption[] = [];
  //   if (res.success) {
  //     options = res.data.rows.map((u: any) => ({ value: u.id, label: u.first_name + " " + u.last_name }));
  //   }
  //   // If in edit mode and selectedId is not in options, fetch and append
  //   if (selectedId && !options.some(opt => opt.value === selectedId)) {
  //     try {
  //       const singleRes = await userService.getUserById(selectedId);
  //       if (singleRes.success) {
  //         const u = singleRes.data;
  //         options.push({ value: u.id, label: u.first_name + " " + u.last_name });
  //       }
  //     } catch (e) {
  //       // ignore error
  //     }
  //   }
  //   return options;
  // };

  const [technicianOptions, setTechnicianOptions] = useState<Option[]>([]);

  const fetchTechnicianOptions = async () => {
    const res = await userService.getAllUsers("", undefined, undefined, 50, 1, "technician");
    if (res.success) {
      const options = res.data.rows.map((u: any) => ({ 
        value: u.id, 
        label: u.first_name + " " + u.last_name 
      }));
      setTechnicianOptions(options);
    }
  };

  useEffect(() => {
    fetchTechnicianOptions();
  }, []);

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
          name: location.name,
          address_line_1: location.address_line_1,
          address_line_2: location.address_line_2,
          city: location.city,
          postal_code: location.postal_code,
          province: location.province
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
            company_name: customer.first_name,
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
              name: location.name,
              address_line_1: location.address_line_1,
              address_line_2: location.address_line_2,
              city: location.city,
              postal_code: location.postal_code,
              province: location.province
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
            console.log("Setting initial values - technicians:", projectDetails.technicians);
            console.log("Setting initial values - technician_ids:", projectDetails.technician_ids);
            setInitialValues({
              name: projectDetails.name,
              company: {
                id: projectDetails.company.id,
                company_name: projectDetails.company.company_name,
                first_name: projectDetails.company.first_name,
                last_name: projectDetails.company.last_name,
              },
              technicians: (projectDetails.technicians || []).map(tech => ({
                id: tech.id || '',
                first_name: tech.first_name || '',
                last_name: tech.last_name || ''
              })),
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
              specific_location: projectDetails.specific_location,
              site_email: projectDetails.site_email,
              site_contact_name: projectDetails.site_contact_name,
              site_contact_title: projectDetails.site_contact_title,
              status: projectDetails.status,
              location_id: projectDetails.location_id,
              report_template_id: projectDetails.report_template_id,
              pm_id: projectDetails.pm_id,
              technician_ids: projectDetails.technician_ids || (projectDetails.technicians || []).map(tech => tech.id).filter(id => id),
              customer_id: projectDetails.customer_id,
              start_date: projectDetails.start_date,
              end_date: projectDetails.end_date,
              report_id: projectDetails.reports[0].id,
              project_type: projectDetails.project_type || "",
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

  // Fetch Project Managers for Admin
  useEffect(() => {
    const fetchProjectManagers = async () => {
      if (user && user.role && user.role.toLowerCase() === "admin") {
        const res = await userService.getAllUsers(undefined, undefined, undefined, 20, 1, "project manager");
        if (res.success) {
          setProjectManagers(res.data.rows.map((u: any) => ({ id: u.id, first_name: u.first_name, last_name: u.last_name })));
        }
      }
    };
    fetchProjectManagers();
  }, [user]);

  const handleSubmit = async (values: ProjectData, { setSubmitting }: FormikHelpers<ProjectData>) => {
    console.log("Form submission - technician_ids:", values.technician_ids);
    console.log("Form submission - technicians:", values.technicians);
    try {
      setIsLoading(true);
      if (user && user.role) {
        if (user.role.toLowerCase() === "project manager") {
          values.pm_id = user.id;
          values.pm = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
          };
        } else if (user.role.toLowerCase() === "admin") {
          // pm_id already set from form
          const selectedPM = projectManagers.find(pm => pm.id === values.pm_id);
          if (selectedPM) {
            values.pm = {
              id: selectedPM.id,
              first_name: selectedPM.first_name,
              last_name: selectedPM.last_name,
            };
          }
        } else {
          values.pm_id = "1"; // fallback or default
        }
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
        <div className="flex-1">
          <h2 className="font-semibold text-xl text-sf-black-300">
            {id ? "Edit Project" : "Add Project"}
          </h2>
          {projectNumber && (
            <p className="text-sm text-gray-500 mt-1">
              Project Number: {projectNumber}
            </p>
          )}
        </div>
        {id && initialValues.report_id && (
          <Button
            className="bg-safetech-gray text-black"
            onClick={() => navigate(`/project-reports/${initialValues?.report_id}/edit`)}
          >
            Edit Report <SquarePen className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={getValidationSchema(user?.role)}
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

                <div className="grid w-full items-center gap-3 relative">
                  <Label htmlFor="project_type">Type Of Project</Label>
                  <Select
                    value={values.project_type || ""}
                    onValueChange={(value) => setFieldValue("project_type", value)}
                  >
                    <SelectTrigger className="w-full py-7.5">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Renovation">Renovation</SelectItem>
                        <SelectItem value="Demolition">Demolition</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="min-h-[20px] relative">
                    {errors.project_type && touched.project_type && (
                      <div className="text-red-500 text-sm absolute left-0 top-0">{errors.project_type}</div>
                    )}
                  </div>
                </div>

                <div className="grid w-full items-center gap-3 relative">
                  
                </div> 
                
                <div className="grid w-full gap-3">
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
                              {location.name + ' - ' + location.address_line_1 + ' - ' + location.address_line_2 + ' - ' + location.city + ' - ' + location.province + ' - ' + location.postal_code}
                            </SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="min-h-[20px] relative">
                    {errors.location_id && touched.location_id && (
                      <div className="text-red-500 text-sm absolute left-0 top-0">{errors.location_id}</div>
                    )}
                  </div>
                </div>

                <div className="grid w-full items-center gap-3 relative">
                  
                </div>

                <div className="grid w-full items-center gap-3 relative">
                  <Label htmlFor="specific_location">Specific Location</Label>
                  <Input
                    type="text"
                    id="specific_location"
                    name="specific_location"
                    placeholder="Kitchen or East Wing"
                    className="py-7.5"
                    value={values.specific_location}
                    onChange={handleChange}
                  />
                  <div className="min-h-[20px] relative">
                    {errors.specific_location && touched.specific_location && (
                      <div className="text-red-500 text-sm absolute left-0 top-0">{errors.specific_location}</div>
                    )}
                  </div>
                </div>

                {/* <div className="grid w-full items-center gap-3 relative">
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
                */}
                
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

                {user && user.role && user.role.toLowerCase() === "admin" && (
                  <div className="grid w-full items-center gap-3 relative">
                    <Label htmlFor="pm_id">Project Manager *</Label>
                    <Select
                      value={values.pm_id}
                      onValueChange={val => setFieldValue("pm_id", val)}
                    >
                      <SelectTrigger className="w-full py-7.5">
                        <SelectValue placeholder="Select project manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {projectManagers.length === 0 ? (
                            <div className="text-center text-gray-500 py-2">No Project Managers Found</div>
                          ) : (
                            projectManagers.map(pm => (
                              <SelectItem key={pm.id} value={pm.id}>{pm.first_name} {pm.last_name}</SelectItem>
                            ))
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <div className="min-h-[20px] relative">
                      {errors.pm_id && touched.pm_id && (
                        <div className="text-red-500 text-sm absolute left-0 top-0">{errors.pm_id}</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid w-full items-center gap-3 relative">
                  <Label htmlFor="technician_ids">Technicians *</Label>
                  <MultiSelect
                    options={technicianOptions}
                    selected={values.technicians.map(tech => ({ value: tech.id, label: `${tech.first_name} ${tech.last_name}` }))}
                    onChange={(selected: Option[]) => {
                      const technicianIds = selected.map(opt => opt.value);
                      const technicians = selected.map(opt => {
                        const nameParts = opt.label.trim().split(/\s+/);
                        const firstName = nameParts[0] || '';
                        const lastName = nameParts.slice(1).join(' ') || '';
                        return { id: opt.value, first_name: firstName, last_name: lastName };
                      });
                      setFieldValue("technician_ids", technicianIds);
                      setFieldValue("technicians", technicians);
                    }}
                    placeholder="Select technicians"
                    className="w-full"
                    triggerClassName="w-full py-7.5"
                  />
                  <div className="min-h-[20px] relative">
                    {errors.technician_ids && touched.technician_ids && (
                      <div className="text-red-500 text-sm absolute left-0 top-0">{errors.technician_ids}</div>
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
              {id && (
                <CardContent className="p-6 pt-0">
                  <div className="space-y-6">
                    <h3 className="font-semibold text-lg">Site Drawings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label>Upload Unmarked Drawings</Label>
                        <Input type="file" multiple onChange={(e) => handleUpload(e.target.files, false)} disabled={isUploadingUnmarked} />
                        {isUploadingUnmarked && <p className="text-sm text-gray-500">Uploading...</p>}
                      </div>
                      <div className="space-y-3">
                        <Label>Upload Marked Drawings</Label>
                        <Input type="file" multiple onChange={(e) => handleUpload(e.target.files, true)} disabled={isUploadingMarked} />
                        {isUploadingMarked && <p className="text-sm text-gray-500">Uploading...</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Unmarked</h4>
                        {isLoadingDrawings ? (
                          <p className="text-sm text-gray-500">Loading...</p>
                        ) : unmarkedDrawings.length === 0 ? (
                          <p className="text-sm text-gray-500">No unmarked drawings</p>
                        ) : (
                          <ul className="divide-y">
                            {unmarkedDrawings.map((d) => (
                              <li key={d.id} className="py-2 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm">{d.file_name}</p>
                                  <p className="text-xs text-gray-500">{new Date(d.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <Button variant="ghost" size="icon" onClick={() => window.open(d.file_url, '_blank')} title="Download">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" title="Delete">
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this drawing?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. The file will be permanently removed.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(d.id)}>Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Marked</h4>
                        {isLoadingDrawings ? (
                          <p className="text-sm text-gray-500">Loading...</p>
                        ) : markedDrawings.length === 0 ? (
                          <p className="text-sm text-gray-500">No marked drawings</p>
                        ) : (
                          <ul className="divide-y">
                            {markedDrawings.map((d) => (
                              <li key={d.id} className="py-2 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm">{d.file_name}</p>
                                  <p className="text-xs text-gray-500">{new Date(d.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <Button variant="ghost" size="icon" onClick={() => window.open(d.file_url, '_blank')} title="Download">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" title="Delete">
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this drawing?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. The file will be permanently removed.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(d.id)}>Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
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
