import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bookmark, CircleX } from "lucide-react";
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { CustomerData, customerService } from "@/services/api/customerService";
import { toast } from "@/components/ui/use-toast";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";

interface CreateCustomerFormProps {
  customerId?: string;
  onCancel?: () => void;
}

function CreateCustomerForm({ customerId, onCancel }: CreateCustomerFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    status: true,
  });

  // Define validation schema using Yup
  const validationSchema = Yup.object({
    name: Yup.string().required("Customer name is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    phone: Yup.string(),
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
              name: response.data.name,
              email: response.data.email,
              phone: response.data.phone,
              status: response.data.status,
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
          setIsLoading(false);
        }
      };
      
      fetchCustomer();
    }
  }, [customerId]);

  const handleSubmit = async (values: CustomerData, { setSubmitting }: FormikHelpers<CustomerData>) => {
    try {
      setIsLoading(true);
      
      const response = customerId
        ? await customerService.updateCustomer(customerId, values)
        : await customerService.createCustomer(values);
      
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
      enableReinitialize
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
        <Form>
          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-14">
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="name">Customer Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Company name"
                  className="py-7.5"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.name && touched.name && (
                  <div className="text-red-500 text-sm">{errors.name}</div>
                )}
              </div>
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={values.status ? "active" : "inactive"}
                  onValueChange={(value) => setFieldValue("status", value === "active")}
                >
                  <SelectTrigger className="w-full py-7.5">
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
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="email">Email</Label>
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
                {errors.email && touched.email && (
                  <div className="text-red-500 text-sm">{errors.email}</div>
                )}
              </div>
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Phone number"
                  className="py-7.5"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.phone && touched.phone && (
                  <div className="text-red-500 text-sm">{errors.phone}</div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-6">
              <Button 
                type="submit"
                className="bg-sf-gray-600 text-white w-[150px] h-[48px]"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? "Saving..." : "Save"} <Bookmark />
              </Button>
              <Button 
                type="button"
                className="w-[150px] h-[48px] bg-sf-secondary text-black"
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
  );
}

export default CreateCustomerForm;
