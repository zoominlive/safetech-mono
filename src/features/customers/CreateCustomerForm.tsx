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

interface CreateCustomerFormProps {
  customerId?: string;
  onCancel?: () => void;
}

function CreateCustomerForm({ customerId, onCancel }: CreateCustomerFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    status: true,
  });

  useEffect(() => {
    // Fetch customer data if in edit mode
    if (customerId) {
      const fetchCustomer = async () => {
        try {
          setIsLoading(true);
          const response = await customerService.getCustomerById(customerId);
          
          if (response.success) {
            setCustomerData({
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

  const handleChange = (field: keyof CustomerData, value: string | boolean) => {
    setCustomerData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Validate form
      if (!customerData.name || !customerData.email) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields",
          variant: "destructive",
        });
        return;
      }
      
      const response = customerId
        ? await customerService.updateCustomer(customerId, customerData)
        : await customerService.createCustomer(customerData);
      
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
    <Card>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-14">
        <div className="grid w-full items-center gap-3">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            type="text"
            id="customerName"
            placeholder="Company name"
            className="py-7.5"
            value={customerData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>
        <div className="grid w-full items-center gap-3">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={customerData.status ? "active" : "inactive"}
            onValueChange={(value) => handleChange("status", value === "active")}
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
            placeholder="company@example.com"
            className="py-7.5"
            value={customerData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
        <div className="grid w-full items-center gap-3">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            type="tel"
            id="phoneNumber"
            placeholder="Phone number"
            className="py-7.5"
            value={customerData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-6">
        <Button 
          className="bg-sf-gray-600 text-white w-[150px] h-[48px]"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"} <Bookmark />
        </Button>
        <Button 
          className="w-[150px] h-[48px] bg-sf-secondary text-black"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel <CircleX />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default CreateCustomerForm;
