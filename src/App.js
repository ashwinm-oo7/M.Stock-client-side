import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  BrowserRouter as Router,
  Navigate,
} from "react-router-dom";
import PortfolioDashboard from "./components/portfolio/PortfolioDashboard";
import AddStock from "./components/portfolio/AddStock";

import StockPriceList from "./components/stocks/StockPriceList";
import StockDetailPage from "./components/stocks/StockDetailPage";
import Header from "./components/Header.js";
import Login from "./components/auth/Login.js";
import Register from "./components/auth/Register.js";
import TransactionHistory from "./components/transactions/TransactionHistory.js";
import AddMoney from "./components/auth/AddMoney.js";
import ForgotPassword from "./components/auth/ForgotPassword.js";
import NotFound from "./context/NotFound.js";
import UserProfile from "./components/auth/UserProfile.js";
import StockAddingBackend from "./components/stocks/StockAddingBackend.js";
import axios from "axios";
import WithdrawMoney from "./components/transactions/WithdrawMoney.js";
import ProtectedRoute from "./components/auth/ProtectedRoute.js";
import AutoLogout from "./components/auth/AutoLogout.js";

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false); // Error message state
  const [userID, setUserID] = useState(false); // Error message state
  const [pics, setPics] = useState("");
  const user = JSON.parse(localStorage.getItem("user")) || null;

  // const authToken = localStorage.getItem("authToken");
  useEffect(() => {
    if (user && user._id) {
      fetchUserProfile(user._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserProfile = async (id) => {
    if (!id) {
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/user-profile/${id}`
      );
      const data = response.data;
      console.log(data);
      if (data.success) {
        setIsAdmin(data?.user?.isAdmin); // ✅ Ensures correct state update
        setPics(data?.user?.profilePicBase64 || "");
        setUserID(data?.user?._id);
        console.log("userdetails", data);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Error fetching user profile", err);
      setIsAdmin(false);
    }
  };
  return (
    <Router>
      <Header isAdmins={isAdmin} profilepic={pics} />
      <AutoLogout />

      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<StockPriceList userID={userID} />} />
        <Route
          path="/stocks/track-performance/:id/:symbol"
          element={<StockDetailPage />}
        />

        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </>

        <>
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/portfolio" element={<PortfolioDashboard />} />
          </Route>
          <Route path="/withdraw-money" element={<WithdrawMoney />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/add-money-wallet" element={<AddMoney />} />{" "}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route
            path="/add-data-stocks"
            element={
              isAdmin ? (
                <StockAddingBackend isAdmins={isAdmin} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </>

        <Route path="/add-stock" element={<AddStock />} />
      </Routes>
    </Router>
  );
};

export default App;
