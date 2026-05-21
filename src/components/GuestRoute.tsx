import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../utils/auth.ts";

export default function GuestRoute() {
  if (isAuthenticated()) {
    return <Navigate to="/listings" replace />;
  }
  return <Outlet />;
}
