import React, { createContext, useState, useContext, useEffect } from "react";

// Create Context
const UserContext = createContext();

// Create a custom hook to use the UserContext
export const useUser = () => useContext(UserContext);

// Create a provider component to wrap around your app
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(false); // Store user object (without sensitive info in localStorage)

  // Set user info from localStorage if already available (you can modify to not include sensitive data)
  useEffect(() => {
    const userFromStorage = JSON.parse(sessionStorage.getItem("user"));
    if (userFromStorage) {
      setUser(userFromStorage);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData)); // Use sessionStorage for sensitive data
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
