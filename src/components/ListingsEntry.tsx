import { Navigate } from "react-router-dom";
import ListingsPage from "../pages/ListingsPage.tsx";
import { isAdmin } from "../utils/auth.ts";

export default function ListingsEntry() {
  if (isAdmin()) {
    return <Navigate to="/admin" replace />;
  }
  return <ListingsPage />;
}
