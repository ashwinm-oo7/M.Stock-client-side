import { useEffect, useState } from "react";
import axios from "axios";

const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Stored Token:", document.cookie);
      console.log("LocalStorage Token:", localStorage.getItem("authToken"));

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            withCredentials: true, // ✅ Ensure cookies are sent
          }
        );

        setUser(response.data.user);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log("Token expired. Logging out...");
          setUser(null);
        }
      }
    };

    console.log("Authorization", user);
    checkAuth();

    // Auto logout when token expires
    const interval = setInterval(
      () => {
        checkAuth();
      },
      5 * 60 * 1000
    ); // ✅ Check every 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  return user;
};

export default useAuth;
