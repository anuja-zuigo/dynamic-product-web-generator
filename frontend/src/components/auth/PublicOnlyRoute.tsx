import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PublicOnlyRoute() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user?.role === "admin") {
      return <Navigate to="/dashboard/admin" replace />;
    }
    return <Navigate to="/dashboard/products" replace />;
  }

  return <Outlet />;
}
