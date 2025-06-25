import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import AuthLayout from "./components/AuthLayout";
import Login from "./pages/Login";
import SetNewPassword from "./pages/SetNewPassword";
import ActivateAccount from "./pages/ActivateAccount";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./ui/ProtectedRoute";
import RoleBasedRoute from "./ui/RoleBasedRoute";
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
import Support from "./pages/Support";
import ProjectReports from "./pages/ProjectReports";
import ProjectReport from "./pages/ProjectReport";
import { ProjectReportReadOnly } from "./features/projectreports/ProjectReportReadOnly";

function App() {
  const { isAuthenticated } = useAuthStore();

  // Define roles that can create and edit
  const managerAdminRoles = ["admin", "project manager"];

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<SetNewPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/activate/:token" element={<ActivateAccount />} />
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

          {/* Projects section */}
          <Route path="projects">
            <Route index element={<Projects />} />
            <Route
              path="create"
              element={
                <RoleBasedRoute allowedRoles={managerAdminRoles}>
                  <Project />
                </RoleBasedRoute>
              }
            />
            <Route path=":id">
              <Route index element={<ProjectDetails />} />
              <Route
                path="edit"
                element={
                  <RoleBasedRoute allowedRoles={managerAdminRoles}>
                    <Project />
                  </RoleBasedRoute>
                }
              />
            </Route>
          </Route>

          {/* Customers section */}
          <Route path="customers">
            <Route index element={<Customers />} />
            <Route
              path="add"
              element={
                <RoleBasedRoute allowedRoles={managerAdminRoles}>
                  <Customer />
                </RoleBasedRoute>
              }
            />
            <Route path=":id">
              <Route index element={<Customer />} />
              <Route
                path="edit"
                element={
                  <RoleBasedRoute allowedRoles={managerAdminRoles}>
                    <Customer />
                  </RoleBasedRoute>
                }
              />
            </Route>
          </Route>

          {/* Reports section */}
          <Route path="reports">
            <Route index element={<Reports />} />
            <Route path=":id">
              <Route index element={<ReportDetails />} />
              <Route
                path="edit"
                element={
                  <RoleBasedRoute allowedRoles={[...managerAdminRoles, 'technician']}>
                    <Report />
                  </RoleBasedRoute>
                }
              />
            </Route>
          </Route>

          {/* Project Reports section */}
          <Route path="project-reports">
            <Route index element={<ProjectReports />} />
            <Route path=":id">
              <Route index element={<ReportDetails />} />
              <Route path="view" element={<ProjectReportReadOnly />} />
              <Route
                path="edit"
                element={
                  <RoleBasedRoute allowedRoles={[...managerAdminRoles, 'technician']}>
                    <ProjectReport />
                  </RoleBasedRoute>
                }
              />
            </Route>
          </Route>

          {/* Staff section - also restrict these pages */}
          <Route path="staff">
            <Route index element={<Users />} />
            <Route
              path="add"
              element={
                <RoleBasedRoute allowedRoles={managerAdminRoles}>
                  <UserForm />
                </RoleBasedRoute>
              }
            />
            <Route path=":id">
              <Route index element={<UserDetails />} />
              <Route
                path="edit"
                element={
                  <RoleBasedRoute allowedRoles={managerAdminRoles}>
                    <UserForm />
                  </RoleBasedRoute>
                }
              />
            </Route>
          </Route>

          <Route path="settings" element={<Settings />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="support" element={<Support/>} />
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
