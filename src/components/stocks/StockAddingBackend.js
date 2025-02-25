import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/StockAddingBackend.css"; // Custom CSS for the page
import { useNavigate } from "react-router-dom";

const StockAddingBackend = ({ isAdmins }) => {
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    currentPrice: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmins === false) {
      navigate("/"); // Redirect to dashboard or another page
    }
  }, [isAdmins, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.symbol || !formData.name || !formData.currentPrice) {
      setMessage({ text: "All fields are required!", type: "error" });
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        process.env.REACT_APP_API_URL + "/stocks/adding-stock-data",
        formData
      );
      setMessage({ text: "Stock added successfully!", type: "success" });
      setFormData({ symbol: "", name: "", currentPrice: "" });
    } catch (error) {
      setMessage({
        text: error.response?.data?.error || "Failed to add stock",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stock-container">
      <div className="stock-card-backend">
        <h2 className="stock-title">Add Stock</h2>

        {message.text && (
          <div className={`message-box ${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Stock Symbol</label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              placeholder="AAPL, TSLA, etc."
            />
          </div>

          <div className="input-group">
            <label>Stock Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Apple, Tesla, etc."
            />
          </div>

          <div className="input-group">
            <label>Current Price ($)</label>
            <input
              type="number"
              name="currentPrice"
              value={formData.currentPrice}
              onChange={handleChange}
              placeholder="Enter price"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Adding..." : "Add Stock"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StockAddingBackend;
