import { Navigate, Outlet } from "react-router-dom";
import { isAdmin, isAuthenticated } from "../utils/auth.ts";

export default function AdminRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    return <Navigate to="/listings" replace />;
  }
  return <Outlet />;
}
