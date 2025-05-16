import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bookmark, CircleX, Upload } from "lucide-react";
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
import { useNavigate, useParams } from "react-router";
import { userService } from "@/services/api/userService";
import { toast } from "@/components/ui/use-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserFormProps {
  userId?: string;
  onCancel?: () => void;
}

// Define the validation schema
const userSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  phone: Yup.string(),
  role: Yup.string().required("Role is required"),
  // Only require password for new users
  password: Yup.string().when('isNewUser', {
    is: true,
    then: () => Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
    otherwise: () => Yup.string(),
  }),
});

function UserForm({ onCancel }: UserFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    phone: "",
    role: "technician",
    password: "",
    deactivated_user: false,
    profile_picture: "",
  });

  useEffect(() => {
    // Fetch user data if in edit mode
    if (id) {
      const fetchUser = async () => {
        try {
          setIsLoading(true);
          const response = await userService.getUserById(id);
          
          if (response.success) {  // Check for success property explicitly
            const userData = response.data;  // Get actual user data
            console.log("userData", userData.role.toLowerCase());
            
            setInitialValues({
              name: userData.name || "",
              email: userData.email || "",
              phone: userData.phone || "",
              role: userData.role.toLowerCase(),
              password: "", // Don't populate password on edit
              deactivated_user: userData.deactivated_user || false,
              profile_picture: userData.profile_picture || "",
            });
            
            if (userData.profile_picture) {
              setImagePreview(userData.profile_picture);
            }
          } else {
            toast({
              title: "Error",
              description: response.message || "Failed to load user data",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          toast({
            title: "Error",
            description: "Failed to load user data",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUser();
    }
  }, [id]);

  // Handle profile picture upload
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload if we have a userId
      if (id) {
        await handleImageUpload(file, setFieldValue);
      }
    }
  };

  const handleImageUpload = async (file: File, setFieldValue: any) => {
    if (!id) {
      toast({
        title: "Upload failed",
        description: "User must be saved before uploading a profile picture",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append("profilePicture", file);
      
      const response:any = await userService.uploadProfilePicture(id, formData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
        // Update the form field
        setFieldValue("profile_picture", response?.data.data.profile_picture);
      } else {
        toast({
          title: "Upload failed",
          description: response.message || "Failed to upload profile picture",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to upload profile picture:", error);
      toast({
        title: "Upload failed",
        description: error?.data?.message || "An error occurred during upload",
        variant: "destructive",
      });
      // Reset preview on error
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      
      const userData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        deactivated_user: values.deactivated_user,
        ...(values.password && { password: values.password }),
      };
      
      let response;
      if (id) {
        response = await userService.updateProfile(id, userData);
        if (response.success) {
          toast({
            title: "Success",
            description: "User updated successfully",
          });
          
          if (onCancel) {
            onCancel();
          } else {
            navigate("/staff");
          }
        }
      } else {
        response = await userService.createUser(userData);
        if (response) {
          toast({
            title: "Success",
            description: "User created successfully",
          });
          navigate("/staff");
        }
      }
    } catch (error: any) {
      console.error("Error saving user:", error);
      const errorMessage = error?.data?.message || error.message || "Failed to save user data";
      toast({
        title: "Error",
        description: errorMessage,
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
      navigate("/users");
    }
  };

  if (isLoading && id) {
    return <CardSkeleton rows={4} columns={2} withFooter={true} />;
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={userSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue }) => (
        <Form>
          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 pt-6">
              {/* Profile Picture Section */}
              <div className="space-y-4 md:col-span-2 mb-4">
                <Label>Profile Picture</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={imagePreview || values.profile_picture} />
                    <AvatarFallback>{values.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="profile-picture" className="cursor-pointer">
                      <div className="flex items-center space-x-2 bg-sf-gray-600 text-white py-2 px-4 rounded-md">
                        <Upload size={18} />
                        <span>{uploadingImage ? "Uploading..." : "Change picture"}</span>
                      </div>
                    </Label>
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, setFieldValue)}
                      disabled={uploadingImage}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="name">Name *</Label>
                <Field
                  as={Input}
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Full name"
                  className="py-7.5"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div className="grid w-full items-center gap-3">
                <Label htmlFor="email">Email *</Label>
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  className="py-7.5"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div className="grid w-full items-center gap-3">
                <Label htmlFor="phone">Phone</Label>
                <Field
                  as={Input}
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  className="py-7.5"
                />
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div className="grid w-full items-center gap-3">
                <Label htmlFor="role">Role *</Label>
                <Field name="role">
                  {({ field }: any) => (
                    <Select 
                      value={field.value} 
                      onValueChange={(value) => setFieldValue("role", value)}
                    >
                      <SelectTrigger className="w-full py-7.5">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Role</SelectLabel>
                          <SelectItem value="super admin">Super Admin</SelectItem>
                          <SelectItem value="project manager">Project Manager</SelectItem>
                          <SelectItem value="technician">Technician</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                <ErrorMessage
                  name="role"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div className="grid w-full items-center gap-3">
                <Label htmlFor="status">Status</Label>
                <Field name="deactivated_user">
                  {({ field }: any) => (
                    <Select 
                      value={field.value ? "inactive" : "active"}
                      onValueChange={(value) => setFieldValue("deactivated_user", value === "inactive")}
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
                  )}
                </Field>
              </div>

            </CardContent>
            <CardFooter className="flex justify-end space-x-6">
              <Button 
                className="bg-sf-gray-600 text-white w-[150px] h-[48px]"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save"} <Bookmark />
              </Button>
              <Button 
                className="w-[150px] h-[48px] bg-sf-secondary text-black"
                onClick={handleCancel}
                type="button"
                disabled={isLoading}
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

export default UserForm;
