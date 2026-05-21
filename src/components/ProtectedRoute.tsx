import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../utils/auth.ts";
import UserSessionGuard from "./UserSessionGuard.tsx";

export default function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <UserSessionGuard />
      <Outlet />
    </>
  );
}
