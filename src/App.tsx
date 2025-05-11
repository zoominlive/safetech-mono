import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import AuthLayout from "./components/AuthLayout";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
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

function App() {
  return (
    <Router>
      <Routes>
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
          <Route path="projects/:id/edit" element={<Project />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/add" element={<Customer />} />
          <Route path="customers/:id" element={<Customer />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<ReportDetails />} />
          <Route path="reports/:id/edit" element={<Report />} />
          <Route path="staff" element={<div>Staff Page</div>} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="support" element={<div>Support Page</div>} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
