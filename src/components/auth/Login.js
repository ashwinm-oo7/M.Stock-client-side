import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/Login.css";

// Create a UserContext to track login state
import { useUser } from "../../context/UserContext.js";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false); // To track if OTP is sent
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (isOtpSent && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setCanResendOtp(true); // Allow OTP resend only when the timer hits 0
    }
  }, [isOtpSent, timeLeft]);

  // Form validation function
  const validateForm = () => {
    const { email, password } = formData;
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format.";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear individual field error on change
  };

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.post(`${apiUrl}/users/login`, formData);
      console.log(response);
      if (response.status === 200 && response.data) {
        setIsOtpSent(true); // OTP has been sent
        setTimeLeft(60);
        setCanResendOtp(false); // Reset resend OTP option

        // const { token, user } = response.data;
        // localStorage.setItem("authToken", token); // Store token in local storage

        // // navigate("/");
        // localStorage.setItem("user", JSON.stringify(user)); // Optionally store user info
        // localStorage.setItem("userId", user._id);
        // sessionStorage.setItem("user", JSON.stringify(user));

        // Get the stored redirect URL
        const redirectTo = localStorage.getItem("redirectTo");

        // If there's a stored redirect URL, navigate to that page, else go to the homepage
        // navigate(redirectTo || "/");

        // Clear the redirect URL from localStorage after login
        localStorage.removeItem("redirectTo");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    if (timeLeft <= 0) {
      setErrorMessage("OTP has expired. Please request a new one.");
      return;
    }
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.post(`${apiUrl}/users/login`, {
        email: formData.email,
        otp: formData.otp,
      });
      console.log(response);
      if (response.status === 200 && response.data) {
        // setIsOtpSent(true);

        const { token, user } = response.data;
        localStorage.setItem("authToken", token); // Store token in local storage

        // navigate("/");
        localStorage.setItem("user", JSON.stringify(user)); // Optionally store user info
        localStorage.setItem("userId", user._id);
        navigate("/");
        // if (response.status === 200) {
        //   localStorage.setItem("authToken", response.data.token);
        //   navigate("/");
        // }
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-container">
      <h2>Login</h2>
      {!isOtpSent ? (
        <form onSubmit={handleLogin}>
          <div className="form-group-login">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-group-login">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
            />
            {errors.password && (
              <p className="error-message">{errors.password}</p>
            )}
          </div>

          {errorMessage && <p className="form-error">{errorMessage}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpVerification}>
          {/* OTP Field */}
          <div className="form-group-login">
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleInputChange}
              placeholder="Enter OTP"
            />

            <p style={{ color: "orangered" }} className="timer">
              Time left: {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")} min
            </p>
          </div>
          {errorMessage && <p className="form-error">{errorMessage}</p>}
          <div className="form-group-login">
            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
          {canResendOtp && (
            <div className="form-group-login">
              <button
                className="resend-otp-button"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          )}
        </form>
      )}
      <p className="register-link">
        Don't have an account? <a href="/register">Register here</a>
      </p>
      <p className="register-link">
        <a href="/forgot-password">Forgot password?</a>
      </p>
    </div>
  );
};

export default Login;
