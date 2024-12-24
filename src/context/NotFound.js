import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/NotFound.css"; // Optional CSS for styling

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); // Redirect after 5 seconds
    }, 5000);

    return () => clearTimeout(timer); // Cleanup timer
  }, [navigate]);
  return (
    <div className="not-found-container">
      <h1 className="not-found-container-h1">404</h1>
      <h2>
        Looking for something? We're sorry. The Web address you entered is not a
        functioning page on our site.
      </h2>
      <p>Oops! The page you're looking for does not exist.</p>
      <button onClick={handleGoHome} className="go-home-button">
        Go to Homepage
      </button>
    </div>
  );
};

export default NotFound;
