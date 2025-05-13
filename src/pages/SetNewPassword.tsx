import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "@/store";

// Create validation schema similar to resetPasswordSchema
const setNewPasswordSchema = Yup.object({
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords do not match')
});

const SetNewPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { resetPassword, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    clearError();
    
    try {
      // Get token from URL query params
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (!token) {
        throw new Error('Reset token is missing');
      }
      
      await resetPassword(values.password, token);
      setIsSubmitted(true);
    } catch (err) {
      // Error handling is done in the store
      console.error('Password reset failed:', err);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-2">Set New Password</h2>
      <h4 className="text-gray-500">
        Create a new secure password for your account
      </h4>
      
      {error && <div className="text-red-500 mt-2">{error}</div>}
      
      {isSubmitted ? (
        <div className="mt-4 text-green-600">
          <p>Your password has been reset successfully.</p>
          <div className="flex items-center justify-center mt-4">
            <Link to="/login" className="text-blue-600 hover:underline">
              Back to Sign in
            </Link>
          </div>
        </div>
      ) : (
        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={setNewPasswordSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="password">New Password</label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-2 py-2 border-2 rounded-md border-gray-500"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <div className="flex flex-col">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <Field
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-2 py-2 border-2 rounded-md border-gray-500"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full text-center bg-gray-950 text-white rounded-xl p-4 font-bold"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              
              <div className="flex items-center justify-center">
                <Link to="/login">
                  Back to <span className="font-bold">Sign in</span>
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};

export default SetNewPassword;