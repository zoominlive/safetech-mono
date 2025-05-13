import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuthStore } from "@/store";
import { loginSchema } from "@/schemas/authSchemas";
import { LockKeyhole, Mail } from "lucide-react";

export default function Login() {
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page they were trying to visit
  const from = location.state?.from || '/dashboard';

  const handleSubmit = async (values: { email: string; password: string }) => {
    clearError();
    
    try {
      await login(values.email, values.password, rememberMe);
      // If login successful, redirect to the page they were trying to access
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled in the store
      console.error("Login failed:", err);
    }
  };

  return (
    <>
      <h2 className="font-inter font-extrabold text-xl sm:text-2xl mt-4">
        Sign in to your account
      </h2>
      <h4 className="text-gray-400 mb-4">Welcome back!</h4>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="email" className="mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Mail />
                </div>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 pl-10 border-2 rounded-md border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
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
                  placeholder="Password"
                  className="w-full px-3 py-2 pl-10 border-2 rounded-md border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div className="flex justify-between">
              <div>
                <input 
                  type="checkbox"
                  id="rememberMe"
                  className="mr-2 h-4 w-4 rounded border-gray-300"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe" className="ml-2">Remember Me</label>
              </div>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            <button
              className="w-full text-center bg-gray-950 text-white rounded-xl p-3 sm:p-4 font-bold hover:bg-gray-800 transition-colors"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
}
