import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuthStore } from "@/store";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      // Redirect to login but save the location they were trying to access
      navigate("/login", { state: { from: location.pathname } });
    }
  }, [isAuthenticated, loading, navigate, location]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // If authenticated, render the protected content
  return isAuthenticated ? children : null;
}

export default ProtectedRoute;
