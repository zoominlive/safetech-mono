import { useState } from "react";
import { Link } from "react-router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuthStore } from "@/store";
import { resetPasswordSchema } from "@/schemas/authSchemas";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (values: { email: string }) => {
    clearError();
    
    try {
      await forgotPassword(values.email);
      setIsSubmitted(true);
    } catch (err) {
      // Error handling is done in the store
      console.error("Reset password failed:", err);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
      <h4 className="text-gray-500">
        Enter your email below to receive instructions
      </h4>
      
      {error && <div className="text-red-500 mt-2">{error}</div>}
      
      {isSubmitted && !error ? (
        <div className="mt-4 text-green-600">
          <p>Password reset instructions sent to your email.</p>
          <div className="flex items-center justify-center mt-4">
            <Link to="/login" className="text-blue-600 hover:underline">
              Back to Sign in
            </Link>
          </div>
        </div>
      ) : (
        <Formik
          initialValues={{ email: "" }}
          validationSchema={resetPasswordSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="email">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail />
                  </div>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="w-full px-2 py-2 pl-10 border-2 rounded-md border-gray-500"
                  />
                </div>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <button 
                type="submit" 
                className="w-full text-center bg-gray-950 text-white rounded-xl p-4 font-bold"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
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
}
