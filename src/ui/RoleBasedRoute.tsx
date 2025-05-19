import { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "@/store";

type RoleBasedRouteProps = {
  children: ReactNode;
  allowedRoles: string[];
};

const RoleBasedRoute = ({ children, allowedRoles }: RoleBasedRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If user doesn't have required role, redirect to dashboard
  if (!user?.role || !allowedRoles.includes(user.role.toLowerCase())) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default RoleBasedRoute;
