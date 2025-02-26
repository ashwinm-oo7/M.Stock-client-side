import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/AddStock.css"; // Custom CSS for the component
import Pagination from "../Pagination/Pagination";

const AddStock = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { stockId, symbol, currentPrice } = location.state || {}; // Destructure stockId, symbol, and currentPrice
  const [quantity, setQuantity] = useState("");
  const [alertPrice, setAlertPrice] = useState(""); // New state for alert price
  const [alertType, setAlertType] = useState("BUY"); // "BUY" or "SELL"
  const [alerts, setAlerts] = useState([]); // List of active alerts
  const [message, setMessage] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadings, setLoadings] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordPerPage] = useState(10); // Number of records to show per page
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/");
    }
    const fetchPriceHistory = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/stocks/stock-detail/${stockId}`
        );
        console.log("FetchPricehistpry", response);
        setPriceHistory(response.data.priceHistory || []);
      } catch (err) {
        console.error("Error fetching price history:", err);
        setError("Unable to load price history. Please try again.");
      }
    };

    if (stockId) {
      fetchPriceHistory();
      fetchAlerts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockId]);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/alerts/user/${userId}`
      );
      setAlerts(response.data);
    } catch (err) {
      setMessage("Failed to fetch alerts.");
    }
  };

  const handleAddStock = async () => {
    setError("");
    setSuccess("");
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      setError("Please enter a valid quantity greater than 0.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User not logged in. Please log in to continue.");
        setLoading(false);
        return;
      }

      // API call
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/transactions/buy`,
        {
          userId,
          stockId,
          quantity,
        }
      );

      if (response.status === 201) {
        setSuccess("Stock added successfully to your portfolio!");
        setQuantity("");
      } else {
        throw new Error("Unexpected response from the server.");
      }
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data.message || "Error adding stock to portfolio."
        );
      } else if (err.request) {
        setError("No response from the server. Please try again later.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleSellStock = async () => {
    setError("");
    setSuccess("");

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      setError("Please enter a valid quantity greater than 0.");
      return;
    }

    setError("");
    setSuccess("");
    setLoadings(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User not logged in. Please log in to continue.");
        setLoading(false);
        return;
      }

      // API call
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/transactions/sell`,
        {
          userId,
          stockId,
          quantity,
        }
      );
      console.log(response);
      if (response.status === 201) {
        setQuantity("");
        setSuccess("Stock sell successfully to your portfolio!");
      } else {
        throw new Error("Unexpected response from the server.");
      }
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data.message || "Error Selling stock to portfolio."
        );
      } else if (err.request) {
        setError("No response from the server. Please try again later.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoadings(false);
    }
  };
  const handleSetAlert = async () => {
    if (!alertPrice || isNaN(alertPrice) || alertPrice <= 0) {
      setMessage("❌ Please enter a valid alert price.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const email = localStorage.getItem("email"); // Store user email
      console.log("userId: " + userId + " email: " + email);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/alerts/create`,
        {
          userId,
          symbol,
          targetPrice: alertPrice,
          alertType,
          email,
        }
      );

      if (response.status === 201) {
        setMessage("✅ Alert set successfully!");
        setAlertPrice("");
        fetchAlerts();
      }
    } catch (err) {
      setMessage("❌ Error setting alert.");
    }
  };

  // Handle Deleting Alerts
  const handleDeleteAlert = async (alertId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/alerts/${alertId}`);
      setAlerts(alerts.filter((alert) => alert._id !== alertId));
      setMessage("Alert deleted.");
    } catch (err) {
      setMessage("Error deleting alert.");
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = priceHistory.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // Handle page change
  const totalPages = Math.ceil(priceHistory.length / recordsPerPage);
  const handleItemsPerPageChange = (e) => {
    setRecordPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="add-stock-container">
      {loading && (
        <div class="loading-screen">
          <div class="spinner"></div>
        </div>
      )}
      <h1>Add Stock to Portfolio</h1>
      <p className="stock-info">
        <strong>Stock Symbol:</strong> {symbol || "N/A"}{" "}
        <strong>Current Price:</strong> ${currentPrice || "N/A"}
      </p>
      <div className="form-group">
        <label htmlFor="quantity">Enter Quantity:</label>
        <input
          type="number"
          id="quantity"
          className="form-control"
          value={quantity}
          min="1"
          placeholder="e.g., 10"
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <button
        onClick={handleAddStock}
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? "Adding Stock..." : "Add Stock"}
      </button>
      <br />
      <button
        onClick={handleSellStock}
        className="btn btn-primary"
        disabled={loading}
      >
        {loadings ? "Selling Stock..." : "Sell Stock"}
      </button>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <h2>Set Buy/Sell Alert</h2>
      <div className="form-group">
        <label>Alert Price:</label>
        <input
          type="number"
          className="form-control"
          value={alertPrice}
          onChange={(e) => setAlertPrice(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Alert Type:</label>
        <select
          className="form-control"
          value={alertType}
          onChange={(e) => setAlertType(e.target.value)}
        >
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
      </div>
      <button onClick={handleSetAlert} className="btn btn-warning">
        Set Alert
      </button>

      {/* Active Alerts Section */}
      <h2>Active Alerts</h2>
      {alerts.length > 0 ? (
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Stock</th>
              <th>Price</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert._id}>
                <td>{alert.symbol}</td>
                <td>${alert.targetPrice}</td>
                <td>{alert.alertType}</td>
                <td>
                  <button onClick={() => handleDeleteAlert(alert._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No active alerts.</p>
      )}

      {message && <div className="alert">{message}</div>}

      <h2 className="price-history-title">Price History</h2>
      <div className="price-history">
        {currentRecords.length > 0 ? (
          <table className="price-history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Price (USD)</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((entry) => (
                <tr key={entry._id}>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>${entry?.close?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-price-history">
            No price history available for this stock.
          </p>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          indexOfFirstItem={indexOfFirstRecord}
          indexOfLastItem={indexOfLastRecord}
          setResponseValue={priceHistory}
          itemsPerPage={recordsPerPage}
          setCurrentPage={setCurrentPage}
          handleItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
      {/* <StockHistory symbol={symbol} /> */}
    </div>
  );
};

export default AddStock;
