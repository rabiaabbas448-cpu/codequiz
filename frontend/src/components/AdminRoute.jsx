import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Only lets logged-in admins through. Redirects students to their dashboard.
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
};

export default AdminRoute;