import { Navigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useAdmin();

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0b101a", color: "rgba(255,255,255,0.5)" }}>
        Loading session...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}
