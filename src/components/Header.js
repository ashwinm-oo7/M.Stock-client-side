import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { useUser } from "../context/UserContext"; // Make sure to import the hook
import "../css/Header.css"; // Custom CSS for styling the header
import axios from "axios";

const Header = () => {
  // const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState("False"); // Error message state
  const [pics, setPics] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  console.log(user);
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove token from storage
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    navigate("/login"); // Redirect to login page
  };
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser && parsedUser._id) {
        fetchUserProfile(parsedUser._id);
      }
    }
  }, []);

  const fetchUserProfile = async (id) => {
    if (!id) {
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/user-profile/${id}`
      );
      console.log(response);
      const data = response.data;
      if (data.success) {
        setIsAdmin(data?.user?.isAdmin);
        setPics(data?.user?.profilePicBase64);
      } else {
        alert("Failed to fetch user profile");
      }
    } catch (err) {
      console.error("Error fetching user profile");
    }
  };
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">UpStock</Link>
      </div>
      <nav className="nav">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {user ? (
            <>
              {isAdmin && (
                <li>
                  <Link to="/add-data-stocks">AddStock</Link>
                </li>
              )}
              <li>
                <Link to="/transactions">Transaction</Link>
              </li>
              <li>
                <Link to="/portfolio">MyPortfolio</Link>
              </li>
              <li>
                <button
                  className="logout-button"
                  title="logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
              <li className="user-profile">
                <Link to="/user-profile" title="Profile">
                  {user.profilePic ? (
                    <img
                      src={pics || null} // Profile picture URL
                      alt="Profile"
                      className="profile-pic"
                    />
                  ) : (
                    <div className="profile-placeholder1">
                      {user?.name?.[0]}
                    </div>
                  )}
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
