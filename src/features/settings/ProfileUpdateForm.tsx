import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { profileUpdateSchema } from "@/schemas/authSchemas";
import type { UpdateProfileRequest } from "@/services/api/userService";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userService } from "@/services/api/userService";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Save, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ImagePreviewModal } from "@/components/ImagePreviewModal";

const ProfileUpdateForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);
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

  // Remove profile picture handler
  const handleRemoveProfilePicture = async (formikValues?: { first_name: string; last_name: string; email: string; phone: string }) => {
    if (!user?.id) {
      toast({
        title: "Remove failed",
        description: "User ID not found",
        variant: "destructive",
      });
      return;
    }
    try {
      setUploadingImage(true);
      // Use Formik values if provided, else fallback to user values
      const values = formikValues || {
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || ""
      };
      // Call backend to remove profile picture (set to empty string)
      const response = await userService.updateProfile(user.id, { ...values, profile_picture: "" });
      if (response.success) {
        updateUserProfile({ ...user, profile_picture: "" });
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

  // Handle technician signature file selection
  const handleSignatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Upload the signature
      handleSignatureUpload(file);
    }
  };

  // Remove technician signature handler
  const handleRemoveSignature = async (formikValues?: { first_name: string; last_name: string; email: string; phone: string }) => {
    if (!user?.id) {
      toast({
        title: "Remove failed",
        description: "User ID not found",
        variant: "destructive",
      });
      return;
    }
    try {
      setUploadingSignature(true);
      const values = formikValues || {
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || ""
      };
      // Call backend to remove signature (set to empty string)
      const response = await userService.updateProfile(user.id, { ...values, technician_signature: "" });
      if (response.success) {
        updateUserProfile({ ...user, technician_signature: "" });
        setSignaturePreview(null);
        toast({
          title: "Removed",
          description: "Technician signature removed successfully",
        });
      } else {
        toast({
          title: "Remove failed",
          description: response.message || "Failed to remove technician signature",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Remove failed",
        description: error?.data?.message || "An error occurred while removing the technician signature",
        variant: "destructive",
      });
    } finally {
      setUploadingSignature(false);
    }
  };

  // Handle technician signature upload
  const handleSignatureUpload = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Upload failed",
        description: "User ID not found",
        variant: "destructive",
      });
      return;
    }
    try {
      setUploadingSignature(true);
      const formData = new FormData();
      formData.append("technicianSignature", file);
      const response: any = await userService.uploadTechnicianSignature(user.id, formData);
      if (response.success) {
        updateUserProfile({
          ...user,
          technician_signature: response?.data.data.technician_signature
        });
        toast({
          title: "Success",
          description: "Technician signature updated successfully",
        });
      } else {
        toast({
          title: "Upload failed",
          description: response.message || "Failed to upload technician signature",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error?.data?.message || "An error occurred during upload",
        variant: "destructive",
      });
      setSignaturePreview(null);
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleSubmit = async (values: UpdateProfileRequest) => {
    console.log('reached');
    
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
      "admin": { label: "Admin", variant: "destructive" },
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
          <Avatar className="h-24 w-24 cursor-pointer" onClick={() => setShowImageModal(true)}>
            <AvatarImage
              src={imagePreview || user?.profile_picture}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/user/avatar-sf.png";
              }}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
            <AvatarFallback>{user?.first_name?.charAt(0) + '' + user?.last_name?.charAt(0) || "U"}</AvatarFallback>
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
      
      {/* Technician Signature Section (only for technicians) */}
      {user?.role?.toLowerCase() === 'technician' && (
        <div className="space-y-4 mb-8">
          <Label>Technician Signature</Label>
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={signaturePreview || user?.technician_signature}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/user/avatar-sf.png";
                }}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
              <AvatarFallback>TS</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="technician-signature" className="cursor-pointer">
                <div className="flex items-center space-x-2 bg-sf-gray-600 text-white py-2 px-4 rounded-md">
                  <Upload size={18} />
                  <span>{uploadingSignature ? "Uploading..." : "Change signature"}</span>
                </div>
              </Label>
              <input
                id="technician-signature"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSignatureChange}
                disabled={uploadingSignature}
              />
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG or GIF. Max size 2MB.
              </p>
              {(user?.technician_signature || signaturePreview) && (
                <Button
                  type="button"
                  variant="destructive"
                  className="mt-2"
                  onClick={() => handleRemoveSignature()}
                  disabled={uploadingSignature}
                >
                  Remove Signature
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
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
          {user?.role?.toLowerCase() === 'admin' && " As an administrator, you have full access to all features."}
        </p>
      </div>
      
      <Formik
        initialValues={{
          first_name: user?.first_name || "",
          last_name: user?.last_name || "",
          email: user?.email || "",
          phone: user?.phone || "",
        }}
        validationSchema={profileUpdateSchema}
        onSubmit={async (values) => {
          // If technician, include technician_signature in payload
          const payload: UpdateProfileRequest = { ...values };
          if (user?.role?.toLowerCase() === 'technician') {
            payload.technician_signature = user?.technician_signature || "";
          }
          await handleSubmit(payload);
        }}
        enableReinitialize
      >
        {({ errors, touched, values }: { errors: Record<string, any>; touched: Record<string, any>; values: { first_name: string; last_name: string; email: string; phone: string } }) => (
          <>
            <Form className="space-y-6">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="first_name">First Name</Label>
                <Field
                  as={Input}
                  id="first_name"
                  name="first_name"
                  placeholder="Your first name"
                  className={`py-6 ${
                    errors.first_name && touched.first_name ? "border-red-500" : ""
                  }`}
                />
                <ErrorMessage
                  name="first_name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div className="grid w-full items-center gap-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Field
                  as={Input}
                  id="last_name"
                  name="last_name"
                  placeholder="Your last name"
                  className={`py-6 ${
                    errors.last_name && touched.last_name ? "border-red-500" : ""
                  }`}
                />
                <ErrorMessage
                  name="last_name"
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
            <ImagePreviewModal
              open={showImageModal}
              onOpenChange={setShowImageModal}
              imagePreview={imagePreview}
              profile_picture={user?.profile_picture}
              uploadingImage={uploadingImage}
              onRemove={() => handleRemoveProfilePicture(values)}
            />
          </>
        )}
      </Formik>
    </div>
  );
};

export default ProfileUpdateForm;
