import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaDollarSign } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import "../../css/StockPriceList.css";
// import Pagination from "../Pagination/Pagination";
import LimitPagination from "../Pagination/LimitPagination";

const StockPriceList = ({ userID }) => {
  const [stocks, setStocks] = useState([]); // All stocks
  const [filteredStocks, setFilteredStocks] = useState([]); // Filtered list for search
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState(""); // Search input
  const [currentPage, setCurrentPage] = useState(1);
  const [stocksPerPage, setStocksPerPage] = useState(20);
  const [totalstock, setTotalStock] = useState(0); // Search input

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchStocks = useCallback(
    async (query, page, limit) => {
      setLoading(true);
      setError(""); // Clear previous errors

      try {
        const { data } = await axios.get(
          `${apiUrl}/stocks/getAllStockDetails`,
          {
            params: { page, limit, search: query },
          }
        );

        // ✅ Ensure response data is valid before setting state
        if (data?.stocks) {
          setStocks(data.stocks);
          setFilteredStocks(data.stocks);
          setTotalStock(data.totalStocks || 0);
        } else {
          throw new Error("Invalid response structure");
        }
      } catch (err) {
        console.error("Stock fetch error:", err);
        setError(
          err.response?.data?.message ||
            "Error fetching stocks. Please try again."
        );
      } finally {
        setLoading(false); // ✅ Ensure loading is turned off even if error occurs
      }
    },
    [apiUrl]
  );

  // **🔹 Debounce API Call (Smooth Typing, Prevents Re-renders)**
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStocks(searchTerm, currentPage, stocksPerPage);
    }, 500); // Waits 500ms before making API request

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, currentPage, stocksPerPage, fetchStocks]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/stocks/getAllStockDetails`, {
        params: { page: currentPage, limit: stocksPerPage },
      });
      console.log(response);
      setStocks(response.data.stocks);
      setFilteredStocks(response.data.stocks);
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
  // const currentStocks = filteredStocks.slice(
  //   indexOfFirstStock,
  //   indexOfLastStock
  // );
  const currentStocks = filteredStocks;

  // const totalPages = Math.ceil(filteredStocks.length / stocksPerPage);
  const totalPages = Math.ceil(totalstock / stocksPerPage);

  // Change Page
  const handleItemsPerPageChange = (e) => {
    setStocksPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset pagination when searching
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus(); // Keeps input focused
      }
    }, 0);
  };
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Change Page

  if (loading) return <div className="loading">Loading stocks...</div>;

  return (
    <div className="stock-price-list">
      <h1 className="title">Stocks Overview</h1>
      <div className="top-controls">
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={handleSearchChange} // Use the fixed function
          ref={searchInputRef}
          className="search-input"
          onFocus={() => searchInputRef.current?.focus()} // Prevents focus loss
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
                  Buy/Sell Portfolio
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      <LimitPagination
        totalstock={totalstock}
        currentPage={currentPage}
        totalPages={totalPages}
        indexOfFirstItem={indexOfFirstStock}
        indexOfLastItem={indexOfLastStock}
        setResponseValue={filteredStocks}
        itemsPerPage={stocksPerPage}
        setCurrentPage={setCurrentPage}
        handleItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default StockPriceList;
