import { Navigate, useLocation } from "react-router-dom";
import { getAnyAuthToken, getAuthUserFromToken } from "./services/authSession.js";

function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const token = getAnyAuthToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role) {
    const user = getAuthUserFromToken(role);
    if (user?.role && user.role !== role) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
