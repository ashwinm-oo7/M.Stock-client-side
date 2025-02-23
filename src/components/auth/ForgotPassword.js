// const ForgotPassword = () => {
// import "../../css/ForgotPassword.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState(""); // For both identifier and mobile

  // const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState("");

  // const [otpSent, setOtpSent] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

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
          // setOtpSent(false);
          setOtp("");
          setErrorMessage({ otp: "OTP expired. Please request a new one." });
          setOtpExpiry(null);
          setSuccessMessage("");
          setStep(1);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpExpiry]);

  const validateForm = () => {
    const newErrors = {};

    if (step === 1) {
      // Validation for Step 1: Email
      if (!identifier.trim()) {
        newErrors.identifier = "Email or Number is required.";
      } else if (!/\S+@\S+\.\S+/.test(identifier)) {
        // newErrors.identifier = "Invalid identifier format.";
      }
    }

    if (step === 2 && !otp.trim()) {
      newErrors.otp = "OTP is required.";
    }

    if (step === 2 && !newPassword.trim()) {
      newErrors.password = "Password is required.";
    } else if (newPassword.length < 6 || !validatePassword(newPassword)) {
      newErrors.password =
        "Password must be at least 6 characters long, include one uppercase letter, one lowercase letter, one digit, and the '@' symbol.";
    }

    setErrorMessage(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@])[A-Za-z\d@]{6,}$/;
    return passwordRegex.test(password);
  };
  const isOtpExpired = () => {
    return otpExpiry && Date.now() > otpExpiry;
  };
  const validateIdentifier = (input) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    const mobileRegex = /^\d{10}$/;

    if (emailRegex.test(input)) {
      return "email"; // Valid identifier
    } else if (mobileRegex.test(input)) {
      return "mobile"; // Valid mobile number
    } else {
      return null; // Invalid input
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    // if (!identifier.trim()) {
    //   setErrorMessage("Email is required.");
    //   return;
    // }
    // if (!/\S+@\S+\.\S+/.test(identifier)) {
    //   setErrorMessage("Invalid identifier format.");
    //   return;
    // }
    const validationType = validateIdentifier(identifier);
    console.log(validationType === null);
    if (validationType === null) {
      setErrorMessage({
        identifier: "Enter a valid identifier or 10-digit mobile number.",
      });
      return;
    }

    console.log("Start otp registration");

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${apiUrl}/users/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [validationType]: identifier, reset: true }),
      });
      const data = await response.json();
      console.log(data);
      if (data.success) {
        console.log("OTP Response:", data.otpData.expiresAt); // Log backend response

        const expiryTime = data?.otpData?.expiresAt;

        setOtpExpiry(expiryTime);
        // setOtpSent(true);
        setErrorMessage("");
        // setOtpExpiry(Date.now() + 5 * 60 * 100);
        setStep(2);
        setLoading(false);
        setSuccessMessage("OTP sent to your identifier.", data.message);
      } else {
        setErrorMessage({ identifier: data.message });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);

      setErrorMessage({ form: "Failed to send OTP. Try again." });
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordChange = async () => {
    if (!validateForm()) return;
    if (isOtpExpired()) {
      setErrorMessage({ otp: "OTP has expired. Please request a new one." });
      return;
    }
    const validationType = validateIdentifier(identifier);
    console.log(validationType === null);
    if (validationType === null) {
      setErrorMessage({
        identifier: "Enter a valid identifier or 10-digit mobile number.",
      });
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await axios.post(`${apiUrl}/users/change-password`, {
        [validationType]: identifier,
        otp,
        newPassword,
      });
      console.log(response);
      if (response.data.success) {
        setOtpExpiry(false);
        setSuccessMessage(
          "Password changed successfully! Redirecting..." +
            response.data.message
        );
        setTimeout(() => navigate("/login"), 2000); // Redirect after a delay
      } else {
        setErrorMessage(response.data.message || "Failed to change password.");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Reset Password</h2>
      {step === 1 && (
        <div className="form-group-login">
          <label>Enter Email or Mobile Number:</label>
          <input
            name="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter your identifier or mobile number"
          />
          {errorMessage.identifier && (
            <p className="error-message">{errorMessage.identifier}</p>
          )}
          <button
            style={{ marginTop: "10px" }}
            className="login-button"
            disabled={loading || !identifier}
            onClick={handleSendOtp}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
        </div>
      )}
      {step === 2 && (
        <div className="form-group-login">
          <label>OTP:</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          {errorMessage.otp && (
            <p className="error-message">{errorMessage.otp}</p>
          )}
          {otpExpiry && timeLeft > 0 && (
            <div>
              <p style={{ color: "orangered" }}>
                OTP expires in: {Math.max(Math.floor(timeLeft / 1000), 0)}{" "}
                seconds
              </p>
            </div>
          )}
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          {errorMessage.password && (
            <p className="error-message">{errorMessage.password}</p>
          )}

          <button
            style={{ marginTop: "10px" }}
            className="login-button"
            disabled={loading}
            onClick={handlePasswordChange}
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>

          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
          {errorMessage.form && (
            <p className="error-message">{errorMessage.form}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
