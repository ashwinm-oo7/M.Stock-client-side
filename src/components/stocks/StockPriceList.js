import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaDollarSign } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import "../../css/StockPriceList.css";

const StockPriceList = () => {
  const [stocks, setStocks] = useState([]); // All stocks
  const [filteredStocks, setFilteredStocks] = useState([]); // Filtered list for search
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Search input
  const [currentPage, setCurrentPage] = useState(1);
  const stocksPerPage = 20; // Change this for more/less stocks per page

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get(`${apiUrl}/stocks/getAllStockDetails`);
        setStocks(response.data);
        setFilteredStocks(response.data);
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
      setFilteredStocks(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching stocks. Please try again later.");
      setLoading(false);
    }
  };

  // Search Filter
  useEffect(() => {
    if (!searchTerm) {
      setFilteredStocks(stocks);
      return;
    }
    const filtered = stocks.filter(
      (stock) =>
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStocks(filtered);
    setCurrentPage(1); // Reset to first page
  }, [searchTerm, stocks]);

  // Pagination Logic
  const indexOfLastStock = currentPage * stocksPerPage;
  const indexOfFirstStock = indexOfLastStock - stocksPerPage;
  const currentStocks = filteredStocks.slice(
    indexOfFirstStock,
    indexOfLastStock
  );
  const totalPages = Math.ceil(filteredStocks.length / stocksPerPage);
  const maxPageNumbers = 5; // Show 5 page numbers at a time

  // Change Page
  const getPageNumbers = () => {
    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
    let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

    // Adjust startPage if near the end
    if (totalPages > maxPageNumbers && endPage === totalPages) {
      startPage = totalPages - maxPageNumbers + 1;
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  // Change Page
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) return <div className="loading">Loading stocks...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="stock-price-list">
      <h1 className="title">Stocks Overview</h1>
      <div className="top-controls">
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={refreshData} className="refresh-btn">
          <FiRefreshCcw /> Refresh Stocks
        </button>
      </div>
      <div className="stock-cards">
        {currentStocks.map((stock) => (
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
      {/* Pagination */}
      <div className="pagination">
        {currentPage > 1 && (
          <button
            onClick={() => paginate(1)}
            className="page-btn"
            title="first record"
          >{`<<`}</button>
        )}

        {getPageNumbers().map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`page-btn ${currentPage === number ? "active" : ""}`}
          >
            {number}
          </button>
        ))}

        {currentPage < totalPages && (
          <button
            onClick={() => paginate(totalPages)}
            className="page-btn"
            title="last record"
          >{`>>`}</button>
        )}
      </div>
    </div>
  );
};

export default StockPriceList;
