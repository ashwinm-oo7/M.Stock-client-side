// src/components/stocks/StockPriceList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaDollarSign } from "react-icons/fa"; // For stock price icon
import { FiRefreshCcw } from "react-icons/fi"; // For refresh icon
import "../../css/StockPriceList.css"; // Custom CSS for the component

const StockPriceList = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get(`${apiUrl}/stocks/getAllStockDetails`);

        console.log(response);
        setStocks(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching stocks. Please try again later.");
        setLoading(false);
      }
    };

    fetchStocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/stocks/getAllStockDetails`);
      setStocks(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching stocks. Please try again later.");
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading stocks...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="stock-price-list">
      <h1 className="title">Stocks Overview</h1>
      <div className="refresh-button">
        <button onClick={refreshData} className="refresh-btn">
          <FiRefreshCcw /> Refresh Stocks
        </button>
      </div>

      <div className="stock-cards">
        {stocks.map((stock) => (
          <div key={stock._id} className="stock-card">
            <div className="stock-card-header">
              <h2>{stock.name}</h2>
              <span className="stock-symbol">({stock.symbol})</span>
            </div>
            <div className="stock-card-body">
              <div className="stock-price">
                <FaDollarSign />
                <span className="price">${stock.currentPrice}</span>
              </div>
              <div className="stock-action">
                <Link
                  to={`/stocks/track-performance/${stock._id}/${stock.symbol}`}
                  className="track-btn"
                >
                  Track Performance
                </Link>
              </div>
              <div className="stock-action">
                <Link
                  to="/add-stock"
                  state={{
                    stockId: stock._id,
                    symbol: stock.symbol,
                    currentPrice: stock.currentPrice,
                  }}
                  className="add-stock-btn"
                >
                  Add to Portfolio
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockPriceList;
