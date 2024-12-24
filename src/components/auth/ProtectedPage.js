import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in by looking for a token in localStorage
    const token = localStorage.getItem("authToken");

    // If no token, store the current route (target route) and navigate to login
    if (!token) {
      // Store the target route (where user was trying to go)
      localStorage.setItem("redirectTo", window.location.pathname);
      navigate("/login"); // Redirect to login page
    }
  }, [navigate]);

  return (
    <div>
      {/* Protected Page Content */}
      <h1>Protected Page</h1>
    </div>
  );
};

export default ProtectedPage;
