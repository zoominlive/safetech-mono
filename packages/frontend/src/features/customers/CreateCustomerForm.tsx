import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bookmark, CircleX } from "lucide-react";
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { CustomerData, customerService } from "@/services/api/customerService";
import { toast } from "@/components/ui/use-toast";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import LocationModal from "./LocationModal";
import { LocationData } from "@/types/customer";

interface CreateCustomerFormProps {
  customerId?: string;
  onCancel?: () => void;
  status: boolean;
  onStatusChange: (status: boolean) => void;
}

function CreateCustomerForm({ customerId, onCancel, status, onStatusChange }: CreateCustomerFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  // Update initialValues state to properly use status prop
  const [initialValues, setInitialValues] = useState<CustomerData>({
    first_name: "",
    last_name: "",
    company_name: "",
    email: "",
    phone: "",
    status: status, // use prop
    address_line_1: "",
    address_line_2: "",
    city: "",
    province: "",
    postal_code: "",
  });
  
  // Update form values when status prop changes from the dropdown
  useEffect(() => {
    if (customerId) {
      // In edit mode, let the API response set the initial values
      return;
    }
    
    // In add mode, only update the status field without resetting the form
    setInitialValues(prev => ({ 
      ...prev, 
      status: status 
    }));
  }, [status, customerId]);

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editLocation, setEditLocation] = useState<LocationData | undefined>(undefined);
  const [editLocationIndex, setEditLocationIndex] = useState<number | undefined>(undefined);

  // Define validation schema using Yup
  const validationSchema = Yup.object({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    phone: Yup.string()
      .test(
        "is-valid-phone",
        "Phone must be 10-15 digits",
        (value) => {
          if (!value) return true; // optional
          return /^[0-9]{10,15}$/.test(value);
        }
      ),
    address_line_1: Yup.string().required("Address Line 1 is required"),
    city: Yup.string().required("City is required"),
    province: Yup.string().required("Province is required"),
    postal_code: Yup.string().required("Postal Code is required"),
  });

  useEffect(() => {
    // Fetch customer data if in edit mode
    if (customerId) {
      const fetchCustomer = async () => {
        try {
          setIsLoading(true);
          const response = await customerService.getCustomerById(customerId);
          
          if (response.success) {
            setInitialValues({
              first_name: response.data.first_name || "",
              last_name: response.data.last_name || "",
              company_name: response.data.company_name || "",
              email: response.data.email,
              phone: response.data.phone,
              status: response.data.status,
              address_line_1: response.data.address_line_1 || "",
              address_line_2: response.data.address_line_2 || "",
              city: response.data.city || "",
              province: response.data.province || "",
              postal_code: response.data.postal_code || "",
            });
            setLocations(response.data.locations || []);
            onStatusChange(response.data.status); // sync status
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
          setIsLoading(false);
        }
      };
      
      fetchCustomer();
    }
  }, [customerId, onStatusChange]);

  // Location handlers
  const handleAddLocation = (location: LocationData) => {
    setLocations((prev) => [...prev, location]);
  };
  const handleEditLocation = (index: number, updated: LocationData) => {
    setLocations((prev) => prev.map((loc, i) => (i === index ? updated : loc)));
  };
  const handleRemoveLocation = (index: number) => {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: CustomerData, { setSubmitting }: FormikHelpers<CustomerData>) => {
    try {
      setIsLoading(true);
      // Create payload with form values and current status
      const payload = { 
        ...values,
        status: status, // Always use the current status from props
        locations 
      };
      const response = customerId
        ? await customerService.updateCustomer(customerId, payload)
        : await customerService.createCustomer(payload);
      
      if (response.success) {
        toast({
          title: "Success",
          description: customerId ? "Customer updated successfully" : "Customer created successfully",
        });
        navigate("/customers");
      } else {
        toast({
          title: "Error",
          description: response.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description: "Failed to save customer data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/customers");
    }
  };

  if (isLoading && customerId) {
    return <CardSkeleton rows={2} columns={2} withFooter={true} />;
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={customerId ? true : false} // Only reinitialize in edit mode, not add mode
    >
      {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
        <Form>
          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  type="text"
                  id="company_name"
                  name="company_name"
                  placeholder="Company name"
                  className="py-7.5"
                  value={values.company_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <div className="min-h-[20px] relative">
                  {errors.company_name && touched.company_name && (
                    <div className="text-red-500 text-sm absolute left-0 top-0">{errors.company_name}</div>
                  )}
                </div>
              </div>
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="first_name">Primary Contact First Name</Label>
                <Input
                  type="text"
                  id="first_name"
                  name="first_name"
                  placeholder="First name"
                  className="py-7.5"
                  value={values.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <div className="min-h-[20px] relative">
                  {errors.first_name && touched.first_name && (
                    <div className="text-red-500 text-sm absolute left-0 top-0">{errors.first_name}</div>
                  )}
                </div>
              </div>
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="last_name">Primary Contact Last Name</Label>
                <Input
                  type="text"
                  id="last_name"
                  name="last_name"
                  placeholder="Last name"
                  className="py-7.5"
                  value={values.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <div className="min-h-[20px] relative">
                  {errors.last_name && touched.last_name && (
                    <div className="text-red-500 text-sm absolute left-0 top-0">{errors.last_name}</div>
                  )}
                </div>
              </div>
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="phone">Primary Contact Phone Number</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Phone number"
                  className="py-7.5"
                  value={values.phone}
                  maxLength={15}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "");
                    e.target.value = digitsOnly;
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                />
                <div className="min-h-[20px] relative">
                  {errors.phone && touched.phone && (
                    <div className="text-red-500 text-sm absolute left-0 top-0">{errors.phone}</div>
                  )}
                </div>
              </div>
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="email">Primary Contact Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="company@example.com"
                  className="py-7.5"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <div className="min-h-[20px] relative">
                  {errors.email && touched.email && (
                    <div className="text-red-500 text-sm absolute left-0 top-0">{errors.email}</div>
                  )}
                </div>
              </div>
              <div className="col-span-2 border-b pb-4 mb-4">
                <h3 className="font-semibold text-lg mb-2">Head Office Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="grid w-full items-center gap-3">
                    <Label htmlFor="address_line_1">Address Line 1</Label>
                    <Input
                      type="text"
                      id="address_line_1"
                      name="address_line_1"
                      placeholder="Address Line 1"
                      className="py-7.5"
                      value={values.address_line_1}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <div className="min-h-[20px] relative">
                      {errors.address_line_1 && touched.address_line_1 && (
                        <div className="text-red-500 text-sm absolute left-0 top-0">{errors.address_line_1}</div>
                      )}
                    </div>
                  </div>
                  <div className="grid w-full items-center gap-3">
                    <Label htmlFor="address_line_2">Address Line 2</Label>
                    <Input
                      type="text"
                      id="address_line_2"
                      name="address_line_2"
                      placeholder="Address Line 2"
                      className="py-7.5"
                      value={values.address_line_2}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <div className="min-h-[20px] relative">
                      {errors.address_line_1 && touched.address_line_1 && (
                        <div className="text-red-500 text-sm absolute left-0 top-0">{errors.address_line_1}</div>
                      )}
                    </div>
                  </div>
                  <div className="grid w-full items-center gap-3">
                    <Label htmlFor="city">City</Label>
                    <Input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="City"
                      className="py-7.5"
                      value={values.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <div className="min-h-[20px] relative">
                      {errors.city && touched.city && (
                        <div className="text-red-500 text-sm absolute left-0 top-0">{errors.city}</div>
                      )}
                    </div>
                  </div>
                  <div className="grid w-full items-center gap-3">
                    <Label htmlFor="province">Province</Label>
                    <Input
                      type="text"
                      id="province"
                      name="province"
                      placeholder="Province"
                      className="py-7.5"
                      value={values.province}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <div className="min-h-[20px] relative">
                      {errors.province && touched.province && (
                        <div className="text-red-500 text-sm absolute left-0 top-0">{errors.province}</div>
                      )}
                    </div>
                  </div>
                  <div className="grid w-full items-center gap-3">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      type="text"
                      id="postal_code"
                      name="postal_code"
                      placeholder="Postal Code"
                      className="py-7.5"
                      value={values.postal_code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <div className="min-h-[20px] relative">
                      {errors.postal_code && touched.postal_code && (
                        <div className="text-red-500 text-sm absolute left-0 top-0">{errors.postal_code}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            {/* Locations Section */}
            <div className="col-span-2 mb-8 px-6">
              <div className="flex justify-between items-center mb-2">
                <Label>Locations</Label>
                <Button
                  type="button"
                  onClick={() => {
                    setShowLocationModal(true);
                    setEditLocation(undefined);
                    setEditLocationIndex(undefined);
                  }}
                  className="bg-gray-700 dark:bg-gray-600 text-white hover:bg-gray-800 dark:hover:bg-gray-700 w-[150px] h-[48px] flex items-center justify-center"
                >
                  Add Location
                </Button>
              </div>
              {locations.length === 0 && <div className="text-sf-gray-500">No locations added.</div>}
              <div className="space-y-2">
                {locations.map((loc, idx) => (
                  <div key={idx} className="flex items-center gap-2 border rounded p-2">
                    <div className="flex-1">
                      <div className="font-semibold">{loc.name}</div>
                      <div className="text-xs text-sf-gray-500">{loc.address_line_1}, {loc.address_line_2} {loc.city}, {loc.province}, {loc.postal_code}</div>
                    </div>
                    <Button type="button" size="sm" className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => { setEditLocationIndex(idx); setEditLocation(loc); setShowLocationModal(true); }}>Edit</Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveLocation(idx)}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>
            <CardFooter className="flex justify-end space-x-6">
              <Button 
                type="submit"
                className="bg-gray-700 dark:bg-gray-600 text-white hover:bg-gray-800 dark:hover:bg-gray-700 w-[150px] h-[48px]"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? "Saving..." : "Save"} <Bookmark />
              </Button>
              <Button 
                type="button"
                className="w-[150px] h-[48px] bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={handleCancel}
                disabled={isSubmitting || isLoading}
              >
                Cancel <CircleX />
              </Button>
            </CardFooter>
          </Card>
          {/* Location Modal */}
          {showLocationModal && (
            <LocationModal
              open={showLocationModal}
              onClose={() => { setShowLocationModal(false); setEditLocation(undefined); setEditLocationIndex(undefined); }}
              onSave={(loc: LocationData) => {
                if (editLocationIndex !== undefined) {
                  handleEditLocation(editLocationIndex, loc);
                } else {
                  handleAddLocation(loc);
                }
                setShowLocationModal(false);
                setEditLocation(undefined);
                setEditLocationIndex(undefined);
              }}
              initialData={editLocation}
            />
          )}
        </Form>
      )}
    </Formik>
  );
}

export default CreateCustomerForm;
