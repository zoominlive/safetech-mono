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
import BackButton from "@/components/BackButton";
import { ImagePreviewModal } from "@/components/ImagePreviewModal";
import { getProfilePictureUrl } from "@/utils/profilePicture";

interface UserFormProps {
  userId?: string;
  onCancel?: () => void;
}

// Define the validation schema
const userSchema = Yup.object({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
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

const BACKEND_URL = window.location.hostname === 'localhost' ? 
  'http://localhost:8000/api/v1' : 
  'http://15.156.127.37/api/v1';

function UserForm({ onCancel }: UserFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  
  const [initialValues, setInitialValues] = useState({
    first_name: "",
    last_name: "",
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
              first_name: userData.first_name || "",
              last_name: userData.last_name || "",
              email: userData.email || "",
              phone: userData.phone || "",
              role: userData.role.toLowerCase(),
              password: "", // Don't populate password on edit
              deactivated_user: userData.deactivated_user || false,
              profile_picture: userData.profile_picture || "",
            });
            console.log(BACKEND_URL + '' + userData.profile_picture);
            
            if (userData.profile_picture) {
              setImagePreview(BACKEND_URL + '' + userData.profile_picture);
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
        first_name: values.first_name,
        last_name: values.last_name,
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

  // Remove profile picture handler
  const handleRemoveProfilePicture = async (formikValues?: { first_name: string; last_name: string; email: string; phone: string; role: string; deactivated_user: boolean; password?: string }) => {
    if (!id) {
      toast({
        title: "Remove failed",
        description: "User ID not found",
        variant: "destructive",
      });
      return;
    }
    try {
      setUploadingImage(true);
      // Use Formik values if provided, else fallback to initialValues
      const values = formikValues || initialValues;
      const response = await userService.updateProfile(id, { ...values, profile_picture: "" });
      if (response.success) {
        setImagePreview(null);
        toast({
          title: "Removed",
          description: "Profile picture removed successfully",
        });
        setShowImageModal(false);
      } else {
        toast({
          title: "Remove failed",
          description: response.message || "Failed to remove profile picture",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Remove failed",
        description: error?.data?.message || "An error occurred while removing the profile picture",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  if (isLoading && id) {
    return <CardSkeleton rows={4} columns={2} withFooter={true} />;
  }

  {console.log('imagePreview', imagePreview)}
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-8">
        <BackButton/>
        <h2 className="font-semibold text-xl text-sf-black-300">
          {id ? "Edit Staff" : "Add Staff"}
        </h2>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={userSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue }) => (
          <>
            <Form>
              <Card>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 pt-6">
                  {/* Profile Picture Section */}
                  <div className="space-y-4 md:col-span-2 mb-4">
                    <Label>Profile Picture</Label>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-24 w-24 cursor-pointer" onClick={() => setShowImageModal(true)}>
                        <AvatarImage
                          src={getProfilePictureUrl({ imagePreview: imagePreview || undefined, profile_picture: values.profile_picture })}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/user/avatar-sf.png";
                          }}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                        />
                        <AvatarFallback>{values.first_name?.charAt(0) || "U"}</AvatarFallback>
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
                    <Label htmlFor="first_name">First Name *</Label>
                    <Field
                      as={Input}
                      id="first_name"
                      name="first_name"
                      type="text"
                      placeholder="First name"
                      className="py-7.5"
                    />
                    <div className="min-h-[20px] relative">
                      <ErrorMessage
                        name="first_name"
                        component="div"
                        className="text-red-500 text-sm absolute left-0 top-0"
                      />
                    </div>
                  </div>

                  <div className="grid w-full items-center gap-3">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Field
                      as={Input}
                      id="last_name"
                      name="last_name"
                      type="text"
                      placeholder="Last name"
                      className="py-7.5"
                    />
                    <div className="min-h-[20px] relative">
                      <ErrorMessage
                        name="last_name"
                        component="div"
                        className="text-red-500 text-sm absolute left-0 top-0"
                      />
                    </div>
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
                    <div className="min-h-[20px] relative">
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-red-500 text-sm absolute left-0 top-0"
                      />
                    </div>
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
                    <div className="min-h-[20px] relative">
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-red-500 text-sm absolute left-0 top-0"
                      />
                    </div>
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
                    <div className="min-h-[20px] relative">
                      <ErrorMessage
                        name="role"
                        component="div"
                        className="text-red-500 text-sm absolute left-0 top-0"
                      />
                    </div>
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
                    <div className="min-h-[20px] relative">
                    </div>
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
            <ImagePreviewModal
              open={showImageModal}
              onOpenChange={setShowImageModal}
              imagePreview={imagePreview}
              profile_picture={values.profile_picture}
              uploadingImage={uploadingImage}
              onRemove={() => handleRemoveProfilePicture(values)}
            />
          </>
        )}
      </Formik>
    </div>
  );
}

export default UserForm;
