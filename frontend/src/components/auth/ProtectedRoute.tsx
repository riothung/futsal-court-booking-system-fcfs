import { Navigate } from "react-router";
import { getRole } from "../../../services/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const role = getRole();

  if (!role) {
    return <Navigate to="/signin" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
