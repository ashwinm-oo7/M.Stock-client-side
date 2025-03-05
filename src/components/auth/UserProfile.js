import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import "../../css/UserProfile.css";
import axios from "axios";
import { FaPencilAlt } from "react-icons/fa";
import { compressBase64Image } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import BankManagement from "./BankManagement"; // Import the component

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");

  const [username, setUsername] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState(""); // Error message state
  const [success, setSuccess] = useState(""); // Success message state
  const [initialName, setInitialName] = useState(""); // Track initial name
  const [initialUsername, setInitialUsername] = useState(""); // Track initial username

  // Change Password states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const cropperRef = useRef(null);
  // Close Modal on Outside Click
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const [showBankManagement, setShowBankManagement] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      navigate("/login"); // Redirect to dashboard or another page
    }
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  // Fetch user profile data from the backend
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      fetchUserProfile(storedUser._id);
    }
  }, []);
  const fetchUserProfile = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/user-profile/${id}`
      );
      console.log(response);
      const data = response.data;
      if (data.success) {
        setUser(data.user);
        setName(data.user.name);
        setUsername(data.user.username);
        setPortfolio(data.user.walletBalance);
        setInitialName(data.user.name); // Set initial name
        setInitialUsername(data.user.username); // Set initial username
      } else {
        alert("Failed to fetch user profile");
      }
    } catch (err) {
      setError("Error fetching user profile");
    }
  };

  // Handle image drop
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop,
  });

  // Handle crop
  const handleCrop = () => {
    if (cropperRef.current) {
      const cropperInstance = cropperRef.current.cropper;
      if (cropperInstance) {
        const croppedCanvas = cropperInstance.getCroppedCanvas();
        const croppedDataUrl = croppedCanvas.toDataURL();
        setCroppedImage(croppedDataUrl);
      }
    }
  };

  // Validate image
  const validateImage = () => {
    if (!image && !croppedImage) {
      setError("Please upload an image.");
      return false;
    }
    if (image && !image.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return false;
    }
    if (image && image.size > 5 * 1024 * 1024) {
      setError("File size should not exceed 5MB.");
      return false;
    }
    setError("");
    return true;
  };

  // Upload the cropped image or base64 image to the backend
  const handleUpload = async () => {
    if (!validateImage()) return;
    let finalImage = croppedImage;

    if (croppedImage) {
      try {
        finalImage = await compressBase64Image(croppedImage);
      } catch (error) {
        setError("Image compression failed. Please try again.");
        console.error(error);
        return;
      }
    }

    const formData = new FormData();
    if (croppedImage) {
      formData.append("base64Image", finalImage);
    } else if (image) {
      formData.append("profilePic", image);
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/updateProfilePic/${user._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Image uploaded successfully!");
        setIsModalOpen(false);
        setUser((prevUser) => ({
          ...prevUser,
          profilePic: response?.data?.profilePic,
        }));
        setTimeout(() => {
          window.location.reload();
        }, 500); // Delay for better UX (optional)
      } else {
        setError("Upload failed.");
      }
    } catch (error) {
      setError("An error occurred while uploading the image.");
      console.error(error);
    }
  };
  const handleUpdateDetails = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/users/updateDetails/${user._id}`,
        { name, username }
      );
      console.log(response);
      if (response.data.success) {
        setSuccess("Details updated successfully!");
        setUser((prevUser) => ({
          ...prevUser,
          name,
          username,
        }));
        fetchUserProfile(user._id);

        setError("");
      } else if (response.status === 404) {
        setError(response.data.message);
      } else {
        setError("Failed to update details.");
        setSuccess();
      }
    } catch (error) {
      setError(
        error.response.data.message ||
          "An error occurred while updating details."
      );
      setSuccess();
      console.error(error);
    }
  };
  // Open Modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordFields()) return;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/password-change/${user._id}`,
        {
          oldPassword,
          newPassword,
        }
      );

      if (response.data.success) {
        setSuccess("Password changed successfully!");
        setShowChangePassword(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(response.data.message || "Failed to change password.");
      }
    } catch (error) {
      setPasswordError("An error occurred while changing the password.");
      setPasswordError(error.response.data.message);
      console.error(error);
    }
  };
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@])[A-Za-z\d@]{6,}$/;
    return passwordRegex.test(password);
  };

  const validatePasswordFields = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return false;
    }

    if (newPassword.length < 6 || !validatePassword(newPassword)) {
      setPasswordError(
        "Password must be at least 6 characters long, include one uppercase letter, one lowercase letter, one digit, and the '@' symbol.  ex:Abc@123"
      );
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("NewPassword and ConfirmPasswords do not match.");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const toggleChangePassword = () => setShowChangePassword(!showChangePassword);

  const isUpdateDisabled = name === initialName && username === initialUsername;

  return (
    <div className="user-profile-container">
      {user && (
        <>
          <h2>Profile</h2>

          {/* Profile Picture Section */}
          <div className="profile-picture-container">
            <div className="profile-image-wrapper">
              {user?.profilePicBase64 ? (
                <img
                  src={
                    user.profilePicBase64 ||
                    user.profilePic ||
                    "/default-profile.png"
                  }
                  alt="User Profile"
                  className="profile-image"
                />
              ) : (
                <div className="profile-placeholder1">{user?.name?.[0]}</div>
              )}

              <div className="edit-icon" onClick={openModal}>
                <FaPencilAlt /> {/* Use the React Icon here */}
              </div>
            </div>
          </div>
          <div className="user-details-section">
            <label style={{ textAlign: "center" }}>
              wallet Balance: ${portfolio.toFixed(2)}
            </label>
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Username:
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label>
              Email:
              <input type="email" value={user.email} disabled />
            </label>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button
              onClick={handleUpdateDetails}
              className={
                !isUpdateDisabled
                  ? "update-details-btn"
                  : "update-details-btn userdisabled"
              }
              disabled={isUpdateDisabled}
            >
              Update Details
            </button>
          </div>
          <button
            onClick={() => setShowBankManagement(!showBankManagement)}
            className="bg-green-500 text-white p-2 rounded w-full hover:bg-green-600 mt-3"
          >
            {showBankManagement
              ? "Close Bank Management"
              : "Manage Bank Accounts"}
          </button>

          {/* Conditionally Render BankManagement */}
          {showBankManagement && <BankManagement />}
          <div className="toggle-wrapper">
            <strong className="toggle-text">Changed Password:</strong>
            <div className="toggle-container" onClick={toggleChangePassword}>
              <div
                className={`toggle-slider ${
                  showChangePassword ? "active" : ""
                }`}
              >
                <div className="toggle-knob"></div>
              </div>
            </div>
          </div>

          {showChangePassword && (
            <div className="user-details-section">
              <label>
                Old Password:
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Old Password"
                />
              </label>
              <label>
                New Password:
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                />
              </label>
              <label>
                Confirm Password:
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                />
              </label>
              {passwordError && (
                <p className="error-message">{passwordError}</p>
              )}
              <button
                onClick={handlePasswordChange}
                className={
                  oldPassword && newPassword && confirmPassword
                    ? "update-details-btn"
                    : "update-details-btn userdisabled"
                }
                disabled={!oldPassword || !newPassword || !confirmPassword}
              >
                Update Password
              </button>
            </div>
          )}
          {/* Modal for Image Upload */}
          {isModalOpen && (
            <div className="modal">
              <div
                className="modal-content"
                ref={modalRef}
                style={{
                  maxHeight: "80vh",
                  overflowY: "auto",
                }}
              >
                <span
                  className="close-btn"
                  title="close-modal"
                  onClick={closeModal}
                >
                  &times;
                </span>

                <h3>Upload and Edit Your Profile Picture</h3>
                <div {...getRootProps()} className="dropzone">
                  <input {...getInputProps()} />
                  <p>Drag & Drop or Click to Upload an Image</p>
                </div>

                {imagePreview && (
                  <div className="preview-section">
                    <h3>Image Preview</h3>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="preview-image"
                    />
                  </div>
                )}

                {imagePreview && (
                  <div className="crop-section">
                    <h3>Crop Your Image</h3>
                    <Cropper
                      src={imagePreview}
                      style={{ height: 300, width: "100%" }}
                      aspectRatio={1}
                      guides={false}
                      ref={cropperRef}
                    />
                    <button onClick={handleCrop} className="crop-button">
                      Crop Image
                    </button>
                  </div>
                )}

                {croppedImage && (
                  <div className="cropped-preview-section">
                    <h3>Cropped Image Preview</h3>
                    <img
                      src={croppedImage}
                      alt="Cropped Preview"
                      className="preview-image"
                    />
                  </div>
                )}

                <div className="action-buttons">
                  <button onClick={handleUpload} className="upload-button">
                    Upload Image
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserProfile;
