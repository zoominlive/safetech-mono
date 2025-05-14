import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { changePasswordSchema } from "@/schemas/authSchemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/api/authService";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Lock } from "lucide-react";

const ChangePasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    values: { 
      currentPassword: string; 
      newPassword: string; 
      confirmPassword: string 
    },
    { resetForm }: any
  ) => {
    try {
      setIsLoading(true);
      
      const response = await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });
      
      if (response.success) {
        toast({
          title: "Password updated",
          description: "Your password has been changed successfully.",
        });
        resetForm();
      } else {
        toast({
          title: "Password update failed",
          description: response.message || "Failed to update password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to change password:", error);
      toast({
        title: "Update failed",
        description: error?.data?.message || "Current password is incorrect or an error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-medium">Change Password</h3>
      <p className="text-gray-500 mb-6">
        Ensure your account is using a secure password.
      </p>
      
      <Formik
        initialValues={{
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }}
        validationSchema={changePasswordSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="space-y-6">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Field
                as={Input}
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter your current password"
                className={`py-6 ${
                  errors.currentPassword && touched.currentPassword ? "border-red-500" : ""
                }`}
              />
              <ErrorMessage
                name="currentPassword"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Field
                as={Input}
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Enter new password"
                className={`py-6 ${
                  errors.newPassword && touched.newPassword ? "border-red-500" : ""
                }`}
              />
              <ErrorMessage
                name="newPassword"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Field
                as={Input}
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                className={`py-6 ${
                  errors.confirmPassword && touched.confirmPassword ? "border-red-500" : ""
                }`}
              />
              <ErrorMessage
                name="confirmPassword"
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" /> Change Password
                </>
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ChangePasswordForm;
