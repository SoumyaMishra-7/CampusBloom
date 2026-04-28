import { Navigate, useLocation } from "react-router-dom";
import { getAnyAuthToken, getAuthUserFromToken, getStoredAuthRole } from "./services/authSession.js";

function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const token = getAnyAuthToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role) {
    const storedRole = getStoredAuthRole();
    const user = getAuthUserFromToken(role);
    if ((storedRole && storedRole !== role.toUpperCase()) || (user?.role && user.role !== role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
