import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "@/store";
import { LockKeyhole } from "lucide-react";

const activateAccountSchema = Yup.object({
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

const ActivateAccount = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { activateAccount, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    if (!token) {
      clearError();
      // Set error in store
      useAuthStore.setState({ error: 'Activation token is missing' });
    }
  }, [token, clearError]);

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    clearError();
    
    try {
      await activateAccount(values.password, token!);
      setIsSubmitted(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      // Error handling is done in the store
      console.error('Account activation failed:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2">Activate Your Account</h2>
      <h4 className="text-gray-500 mb-6">
        Set your password to complete the activation process
      </h4>
      
      {error && <div className="text-red-500 mt-2 mb-4">{error}</div>}
      
      {isSubmitted ? (
        <div className="mt-4 text-green-600">
          <p>Your account has been activated successfully!</p>
          <p className="mt-2">Redirecting to login page...</p>
        </div>
      ) : (
        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={activateAccountSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="password" className="mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <LockKeyhole />
                  </div>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 pl-10 border-2 rounded-md border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <div className="flex flex-col">
                <label htmlFor="confirmPassword" className="mb-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <LockKeyhole />
                  </div>
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full px-3 py-2 pl-10 border-2 rounded-md border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full text-center bg-gray-950 text-white rounded-xl p-4 font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? "Activating..." : "Activate Account"}
              </button>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default ActivateAccount; 