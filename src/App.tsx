import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import AuthLayout from "./components/AuthLayout";
import Login from "./pages/Login";
import SetNewPassword from "./pages/SetNewPassword";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./ui/ProtectedRoute";
import AppLayout from "./ui/AppLayout";
import Projects from "./pages/Projects";
import Customers from "./pages/Customers";
import Customer from "./pages/Customer";
import { Project } from "./pages/Project";
import ProjectDetails from "./pages/ProjectDetails";
import Reports from "./pages/Reports";
import Report from "./pages/Report";
import ReportDetails from "./pages/ReportDetails";
import Analytics from "./pages/Analytics";
import { useAuthStore } from "./store";
import ForgotPassword from "./pages/ForgotPassword";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import UserForm from "./features/users/UserForm";
import UserDetails from "./features/users/UserDetails";

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<SetNewPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate replace to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/create" element={<Project />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="projects/:id/edit" element={<Project />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/add" element={<Customer />} />
          <Route path="customers/:id" element={<Customer />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<ReportDetails />} />
          <Route path="reports/:id/edit" element={<Report />} />
          <Route path="customers/:id/edit" element={<Customer />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reports" element={<div>Reports Page</div>} />
          <Route path="staff" element={<Users />} />
          <Route path="staff/add" element={<UserForm />} />
          <Route path="staff/:id" element={<UserDetails />} />
          <Route path="staff/:id/edit" element={<UserForm />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="support" element={<div>Support Page</div>} />
        </Route>

        {/* Fallback redirect */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
