import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const userRole = localStorage.getItem("userRole");

  if (!userRole) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to their default path instead of unauthorized
    const defaultPaths: Record<string, string> = {
      retailer: "/retailer/catalog",
      wholesaler: "/wholesaler/dashboard",
      admin: "/admin/analytics",
    };
    return <Navigate to={defaultPaths[userRole] || "/auth/login"} replace />;
  }

  return <Outlet />;
}
