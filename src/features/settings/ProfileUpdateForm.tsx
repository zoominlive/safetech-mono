import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { profileUpdateSchema } from "@/schemas/authSchemas";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userService } from "@/services/api/userService";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Save, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const ProfileUpdateForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { user, updateUserProfile } = useAuthStore();

  // Handle image file selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload the image
      handleImageUpload(file);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Upload failed",
        description: "User ID not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append("profilePicture", file);
      
      const response:any = await userService.uploadProfilePicture(user.id, formData);
      console.log('response', response);
      
      if (response.success) {
        updateUserProfile({
          ...user,
          profile_picture: response?.data.data.profile_picture
        });
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
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

  const handleSubmit = async (values: { name: string; email: string }) => {
    try {
      setIsLoading(true);
      if (!user?.id) {
        toast({
          title: "Update failed",
          description: "User ID not found",
          variant: "destructive",
        });
        return;
      }
      const response = await userService.updateProfile(user.id, values);
      
      if (response.success) {
        updateUserProfile(response.data);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        toast({
          title: "Update failed",
          description: response.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update failed",
        description: error?.data?.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get appropriate role display name and color
  const getRoleBadgeProps = () => {
    const role = user?.role?.toLowerCase() || 'technician';
    
    const variants: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
      "super admin": { label: "Super Admin", variant: "destructive" },
      "project manager": { label: "Project Manager", variant: "secondary" },
      "technician": { label: "Technician", variant: "outline" }
    };

    return variants[role] || { label: role.charAt(0).toUpperCase() + role.slice(1), variant: "outline" };
  };

  const roleBadge = getRoleBadgeProps();

  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-between items-center">
        <h3 className="text-xl font-medium">Profile Information</h3>
        <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
      </div>
      <p className="text-gray-500 mb-6">
        Update your account's profile information and email address.
      </p>
      
      {/* Profile Picture Section */}
      <div className="space-y-4 mb-8">
        <Label>Profile Picture</Label>
        <div className="flex items-center space-x-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={imagePreview ?? user?.profile_picture ?? undefined} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
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
              onChange={handleImageChange}
              disabled={uploadingImage}
            />
            <p className="text-sm text-gray-500 mt-2">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>
      </div>
      
      {/* Add role information display */}
      <div className="p-4 rounded-md bg-gray-50 border mb-6">
        <div className="flex items-center">
          <div className="mr-2 text-gray-600">Current Role:</div>
          <Badge variant={roleBadge.variant} className="ml-auto">
            {roleBadge.label}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Your role determines what actions you can perform in the system.
          {user?.role?.toLowerCase() === 'super admin' && " As an administrator, you have full access to all features."}
        </p>
      </div>
      
      <Formik
        initialValues={{
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
        }}
        validationSchema={profileUpdateSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched }) => (
          <Form className="space-y-6">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="name">Name</Label>
              <Field
                as={Input}
                id="name"
                name="name"
                placeholder="Your name"
                className={`py-6 ${
                  errors.name && touched.name ? "border-red-500" : ""
                }`}
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label htmlFor="email">Email</Label>
              <Field
                as={Input}
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                className={`py-6 ${
                  errors.email && touched.email ? "border-red-500" : ""
                }`}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Field
                as={Input}
                id="phone"
                name="phone"
                type="phone"
                placeholder="your.phone@example.com"
                className={`py-6 ${
                  errors.phone && touched.phone ? "border-red-500" : ""
                }`}
              />
              <ErrorMessage
                name="phone"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <Button 
              type="submit" 
              className="bg-sf-gray-600 py-6" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProfileUpdateForm;
