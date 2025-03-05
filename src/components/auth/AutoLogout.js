import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

const AutoLogout = () => {
  const navigate = useNavigate();
  const user = useAuth();

  useEffect(() => {
    let timeout;
    const userToken = localStorage.getItem("authToken");

    if (!userToken) {
      return;
    }
    // if (!user) {
    //   return;
    // }

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.clear();
        alert("Session expired due to inactivity. Please log in again.");
        navigate("/login");
      }, 60 * 5000);
    };

    document.addEventListener("mousemove", resetTimer);
    document.addEventListener("keydown", resetTimer);

    resetTimer(); // Start timer

    return () => {
      document.removeEventListener("mousemove", resetTimer);
      document.removeEventListener("keydown", resetTimer);
      clearTimeout(timeout);
    };
  }, [navigate, user]);

  return null;
};

export default AutoLogout;
