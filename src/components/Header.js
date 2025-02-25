import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { useUser } from "../context/UserContext"; // Make sure to import the hook
import "../css/Header.css"; // Custom CSS for styling the header

const Header = ({ isAdmins, profilepic }) => {
  // const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Error message state
  const [pics, setPics] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || null;

  const handleLogout = () => {
    try {
      localStorage.clear(); // Securely clear all sensitive user data
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      // fetchUserProfile(user._id);
      setIsAdmin(() => isAdmins); // ✅ Ensures correct state update
      setPics(profilepic);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          {isAdmin && (
            <li>
              <Link to="/add-data-stocks">AddStock</Link>
            </li>
          )}
          {user ? (
            <>
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
                  {pics ? (
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
