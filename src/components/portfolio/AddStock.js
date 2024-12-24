import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../../css/AddStock.css"; // Custom CSS for the component
import StockHistory from "../stocks/StockHistory";

const AddStock = () => {
  const location = useLocation();
  const { stockId, symbol, currentPrice } = location.state || {}; // Destructure stockId, symbol, and currentPrice
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadings, setLoadings] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10); // Number of records to show per page

  useEffect(() => {
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

    if (stockId) fetchPriceHistory();
  }, [stockId]);

  const handleAddStock = async () => {
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
  const handleBuyStock = async () => {
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
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = priceHistory.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
        onClick={handleBuyStock}
        className="btn btn-primary"
        disabled={loading}
      >
        {loadings ? "Selling Stock..." : "Sell Stock"}
      </button>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

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
        <div>
          {Array.from(
            { length: Math.ceil(priceHistory.length / recordsPerPage) },
            (_, index) => (
              <button key={index + 1} onClick={() => paginate(index + 1)}>
                {index + 1}
              </button>
            )
          )}
        </div>
      </div>
      <StockHistory symbol={symbol} />
    </div>
  );
};

export default AddStock;
