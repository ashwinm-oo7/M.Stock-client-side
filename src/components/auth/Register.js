import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/Register.css"; // Custom CSS for styling

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@])[A-Za-z\d@]{6,}$/;
    return passwordRegex.test(password);
  };

  // Form validation function
  const validateForm = () => {
    const { name, email, username, password } = formData;
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required.";
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format.";
    }
    if (!username.trim()) newErrors.username = "Username is required.";
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6 || !validatePassword(password)) {
      newErrors.password =
        "Password must be at least 6 characters long, include one uppercase letter, one lowercase letter, one digit, and the '@' symbol.";
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
  const isOtpExpired = () => {
    return otpExpiry && Date.now() > otpExpiry;
  };

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!validatePassword(formData.password)) {
      setErrors({
        ...errors,
        password:
          "Password must be at least 6 characters long, include one uppercase letter, one lowercase letter, one digit, and the '@' symbol.",
      });
      return;
    }
    if (!formData.otp) {
      setErrors("Please enter the OTP.");
      return;
    }
    if (isOtpExpired()) {
      setErrors({ otp: "OTP has expired. Please request a new one." });
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      const response = await axios.post(`${apiUrl}/users/register`, formData);
      const data = await response.data;

      console.log("data", data);
      if (response.status === 201) {
        setSuccessMessage(
          "Registration successful! Redirecting to login...",
          data.message
        );
        setFormData({
          name: "",
          email: "",
          username: "",
          password: "",
          otp: "",
        });
        setOtpSent(false);
        setOtpExpiry(false);
        setTimeout(() => {
          navigate("/login");
        }, 20000);
      }
    } catch (error) {
      setLoading(false);
      if (error.response) {
        const { message } = error.response.data;
        setErrors({
          form: message || "Registration failed. Please try again.",
        });
      } else if (error.response && error.response.data.message) {
        setErrors({
          form: error.response.data.message,
        });
      } else {
        setErrors({ form: "Something went wrong. Please try again later." });
      }
    } finally {
      setLoading(false);
    }
  };
  const handleEmailBlur = async () => {
    if (!formData.email.trim()) {
      setErrors({ ...errors, email: "Email is required." });
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/users/validate-email`, {
        email: formData.email,
      });
      console.log(response);
      if (response.data.success === false) {
        setErrors({ ...errors, email: response.data.message });
        setSuccessMessage(""); // Show success
      } else {
        setErrors({ ...errors, email: "" }); // Clear the email error if valid
        setSuccessMessage(response.data.message); // Show success
      }
    } catch (error) {
      setSuccessMessage(""); // Show success
      const errorMessage =
        error.response?.data?.message ||
        "Could not validate email. Please try again later.";
      console.error("Error validating email domain:", errorMessage);

      setErrors({ ...errors, email: errorMessage });
    }
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;

    console.log("Start otp registration");

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/users/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      console.log(data);
      if (data.success) {
        console.log("OTP Response:", data.otpData.expiresAt); // Log backend response

        const expiryTime = data?.otpData?.expiresAt;

        setOtpExpiry(expiryTime);
        setOtpSent(true);

        // setOtpExpiry(Date.now() + 5 * 60 * 100);

        setLoading(false);
        setSuccessMessage("OTP sent to your email.", data.message);
      } else {
        setErrors({ email: data.message });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);

      setErrors({ form: "Failed to send OTP. Try again." });
    } finally {
      setLoading(false);
    }
  };
  const calculateTimeLeft = () => {
    if (otpExpiry) {
      const now = Date.now();
      const timeLeft = otpExpiry - now;
      return timeLeft > 0 ? timeLeft : 0;
    }
    return 0;
  };

  // Timer effect
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (otpExpiry) {
      const interval = setInterval(() => {
        const left = calculateTimeLeft();
        setTimeLeft(left);
        if (left === 0) {
          clearInterval(interval);
          setOtpSent(false); // Reset OTP sent state
          setFormData({ ...formData, otp: "" }); // Clear OTP field
          setErrors({ otp: "OTP expired. Please request a new one." });
          setOtpExpiry(null);
          setSuccessMessage("");
        }
      }, 1000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpExpiry]);

  return (
    <div className="register-container">
      <h2>Register</h2>
      {loading && (
        <div class="loading-screen">
          <div class="spinner"></div>
        </div>
      )}

      <form onSubmit={handleRegister}>
        <div className="form-group-register">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleInputChange}
          />
          {errors.name && <p className="login-error-message">{errors.name}</p>}
        </div>

        <div className="form-group-register">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleEmailBlur}
          />
          {errors.email && (
            <p className="login-error-message">{errors.email}</p>
          )}
        </div>

        <div className="form-group-register">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleInputChange}
          />
          {errors.username && (
            <p className="login-error-message">{errors.username}</p>
          )}
        </div>

        <div className="form-group-register">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleInputChange}
          />
          {errors.password && (
            <p className="login-error-message">{errors.password}</p>
          )}
        </div>

        {errors.form && <p className="form-error">{errors.form}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        {otpSent && (
          <div className="form-group-register">
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleInputChange}
            />
            {errors.otp && <p className="login-error-message">{errors.otp}</p>}
          </div>
        )}
        {otpExpiry && (
          <div>
            <p style={{ color: "orangered" }}>
              OTP expires in: {Math.max(Math.floor(timeLeft / 1000), 0)} seconds
            </p>
          </div>
        )}

        {!otpSent ? (
          <button
            className="register-button"
            disabled={loading}
            onClick={handleSendOtp}
          >
            {otpExpiry == null && loading ? "SIgn Up..." : "Sign Up"}
          </button>
        ) : (
          <button
            onClick={handleRegister}
            className="register-button"
            disabled={loading}
          >
            {loading ? "Verify..." : "Verify"}
          </button>
        )}
        <p className="register-link">
          <a href="/login">Already have an account? </a>
        </p>

        {/* <button type="submit" className="register-button" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button> */}
      </form>
    </div>
  );
};

export default Register;
