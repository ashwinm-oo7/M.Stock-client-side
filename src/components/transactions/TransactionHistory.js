import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/TransactionHistory.css"; // External CSS for better styling
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Pagination from "../Pagination/Pagination.js";
const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [aggregatedData, setAggregatedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [filters, setFilters] = useState({
    symbol: "",
    transactionType: "",
    startDate: "",
    endDate: "",
  });

  const userId = localStorage.getItem("userId");
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/transactions/history/${userId}`,
          { params: filters }
        );
        setTransactions(response.data.transactions);
        console.log(response.data);
        console.log("transactions", transactions);
        setAggregatedData(response.data.aggregatedData);
      } catch (err) {
        setError("Failed to fetch transaction data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchTransactionHistory();
  }, [userId, filters]);

  const handleFilterChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [e.target.name]: e.target.value,
    }));
  };
  const formatChartData = () => {
    if (!transactions || transactions.length === 0) return [];

    // Group transactions by date
    const dataMap = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, buy: 0, sell: 0 };
      }
      if (transaction.type === "buy") {
        acc[date].buy += transaction.quantity * transaction.price;
      } else {
        acc[date].sell += transaction.quantity * transaction.price;
      }
      return acc;
    }, {});

    // Convert object to array and sort by date
    return Object.values(dataMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  const handleClearFilters = () => {
    setFilters({
      symbol: "",
      transactionType: "",
      startDate: "",
      endDate: "",
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(
    transactions && transactions?.length / itemsPerPage
  );
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="transaction-history-container">
      {loading ? (
        <div className="loading">Loading transactions...</div>
      ) : error ? (
        <div className="error-message">
          <h2>{error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Filter Section */}
          <div className="filter-section card">
            {/* <h2>Transaction Filters</h2> */}
            <h2>Transaction Summary</h2>
            <div className="filter-form">
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="symbol"
                    value={filters.symbol}
                    onChange={handleFilterChange}
                    placeholder="Stock Symbol"
                  />
                </div>
                <div className="form-group">
                  <select
                    name="transactionType"
                    value={filters.transactionType}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                <div className="form-group">
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    placeholder="Start Date"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    placeholder="End Date"
                  />
                </div>
                <div className="form-actions">
                  <button
                    onClick={handleClearFilters}
                    className="clear-filters-btn"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="summary card">
              <div className="summary-data">
                <div className="summary-item">
                  <strong>Total Buy Value:</strong> $
                  {aggregatedData.totalBuyValue?.toFixed(2)}
                </div>
                <div className="summary-item">
                  <strong>Total Sell Value:</strong> $
                  {aggregatedData.totalSellValue?.toFixed(2)}
                </div>
                <div className="summary-item">
                  <strong>Net Gain:</strong> $
                  {aggregatedData.netGain?.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          {/* Summary Section */}
          {/* Transactions List Section */}
          <div className="transactions-list">
            <h3>Your Transaction History</h3>
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Sr.No</th>
                  <th>Transaction Type</th>
                  <th>Stock</th>
                  <th>Quantity</th>
                  <th>Price (USD)</th>
                  <th>Date</th>
                  <th>Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {currentItems &&
                  currentItems.map((transaction, index) => (
                    <tr key={transaction._id}>
                      <td>{index + 1}</td>
                      <td>{transaction.type}</td>
                      <td>{transaction.stockId?.symbol}</td>
                      <td>{transaction.quantity}</td>
                      <td>${transaction.price.toFixed(2)}</td>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td
                        className={
                          transaction.type === "sell" &&
                          transaction.profitLoss > 0
                            ? "profit"
                            : "loss"
                        }
                      >
                        ${transaction.profitLoss?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {/* Chart Section */}
          <div className="chart-container">
            {transactions.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <h3>Transaction Trend</h3>
                <p>
                  Graphical representation of your buy/sell trends over time can
                  be shown here.
                </p>
                <LineChart data={formatChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip /> <Legend />
                  <Line
                    type="monotone"
                    dataKey="buy"
                    stroke="#4CAF50"
                    name="Buy Value"
                    strokeWidth={2}
                    dot={{ r: 4 }} // Small dots at each data point
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sell"
                    stroke="#FF5733"
                    name="Sell Value"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No transaction data available for visualization.</p>
            )}
          </div>
          <br />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            setResponseValue={transactions}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}
    </div>
  );
};

export default TransactionHistory;
