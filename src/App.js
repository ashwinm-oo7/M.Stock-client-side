import React, { useEffect } from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
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
const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<StockPriceList />} />
        <Route
          path="/stocks/track-performance/:id/:symbol"
          element={<StockDetailPage />}
        />
        <Route path="/portfolio" element={<PortfolioDashboard />} />
        <Route path="/add-stock" element={<AddStock />} />
        {/* <Route
          path="/track-performance/:userId/:stockId"
          element={<TrackStockPerformance />}
        /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/protected" element={<ProtectedPage />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/TrackStockPerformance"
          element={<TrackStockPerformance />}
        />
        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/add-money-wallet" element={<AddMoney />} />{" "}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/user-profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
};

export default App;
