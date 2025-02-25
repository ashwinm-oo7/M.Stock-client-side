import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  BrowserRouter as Router,
  Navigate,
} from "react-router-dom";
import PortfolioDashboard from "./components/portfolio/PortfolioDashboard";
import AddStock from "./components/portfolio/AddStock";
import TrackStockPerformance from "./components/portfolio/TrackStockPerformance";
import StockPriceList from "./components/stocks/StockPriceList";
import StockDetailPage from "./components/stocks/StockDetailPage";
import Header from "./components/Header.js";
import Login from "./components/auth/Login.js";
import Register from "./components/auth/Register.js";
import ProtectedPage from "./components/auth/ProtectedPage.js";
import TransactionHistory from "./components/transactions/TransactionHistory.js";
import AddMoney from "./components/auth/AddMoney.js";
import ForgotPassword from "./components/auth/ForgotPassword.js";
import NotFound from "./context/NotFound.js";
import UserProfile from "./components/auth/UserProfile.js";
import StockAddingBackend from "./components/stocks/StockAddingBackend.js";
import axios from "axios";

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false); // Error message state
  const [pics, setPics] = useState("");
  const user = JSON.parse(localStorage.getItem("user")) || null;

  const authToken = localStorage.getItem("authToken");
  useEffect(() => {
    if (user && user._id) {
      fetchUserProfile(user._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async (id) => {
    if (!id) {
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/user-profile/${id}`
      );
      const data = response.data;
      if (data.success) {
        setIsAdmin(() => data?.user?.isAdmin || false); // ✅ Ensures correct state update
        setPics(data?.user?.profilePicBase64 || "");
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
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<StockPriceList />} />
        <Route
          path="/stocks/track-performance/:id/:symbol"
          element={<StockDetailPage />}
        />
        {/* <Route
          path="/track-performance/:userId/:stockId"
          element={<TrackStockPerformance />}
        /> */}
        {!authToken ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/protected" element={<ProtectedPage />} />
          </>
        ) : (
          <>
            <Route path="/portfolio" element={<PortfolioDashboard />} />
            <Route path="/add-stock" element={<AddStock />} />
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
        )}
        <Route
          path="/TrackStockPerformance"
          element={<TrackStockPerformance />}
        />
      </Routes>
    </Router>
  );
};

export default App;
