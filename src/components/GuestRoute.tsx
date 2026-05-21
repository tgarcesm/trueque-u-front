import { Navigate, Outlet } from "react-router-dom";
import { isAdmin, isAuthenticated } from "../utils/auth.ts";

export default function GuestRoute() {
  if (isAuthenticated()) {
    return <Navigate to={isAdmin() ? "/admin" : "/listings"} replace />;
  }
  return <Outlet />;
}
