import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("authToken");
  const expiryTime = localStorage.getItem("expiryTime");

  if (!token || Date.now() > expiryTime) {
    localStorage.clear();
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
