import React from "react";
import { Link, useNavigate } from "react-router-dom";
// import { useUser } from "../context/UserContext"; // Make sure to import the hook
import "../css/Header.css"; // Custom CSS for styling the header

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")); // Parse the string into an object
  console.log(user);
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove token from storage
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    navigate("/login"); // Redirect to login page
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Stock Tracker</Link>
      </div>
      <nav className="nav">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/transactions">Transaction</Link>
              </li>
              <li>
                <Link to="/portfolio">My Portfolio</Link>
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
                      src={user.profilePicBase64 || null} // Profile picture URL
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
