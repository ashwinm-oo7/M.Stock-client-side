import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/MoneyTransaction.css";
const MoneyTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, sortOption, dateFrom, dateTo]);

  const fetchTransactions = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/money/history/${userId}`,
        {
          params: { type: filterType, sort: sortOption, dateFrom, dateTo },
        }
      );
      setTransactions(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  return (
    <div className="transaction-container">
      <h2 className="transaction-container-h2">Transaction History</h2>

      {/* Filter Options */}
      <div className="filter-container">
        <select
          onChange={(e) => setFilterType(e.target.value)}
          value={filterType}
        >
          <option value="">All</option>
          <option value="Deposit">Deposit</option>
          <option value="Withdrawal">Withdrawal</option>
          {/* <option value="Buy">Stock Purchase</option> */}
          {/* <option value="Sell">Stock Sale</option> */}
        </select>

        <select
          onChange={(e) => setSortOption(e.target.value)}
          value={sortOption}
        >
          <option value="latest">Latest</option>
          <option value="amount">Highest Amount</option>
        </select>

        <input type="date" onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" onChange={(e) => setDateTo(e.target.value)} />
      </div>

      {/* Transactions Table */}
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>PaymentMethod</th>
            <th>Bank-Account</th>
            <th>Amount ($)</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((txn) => (
              <tr key={txn._id}>
                <td>{new Date(txn.date).toLocaleDateString() || "N/A"}</td>
                <td>{txn.type || "N/A"}</td>
                <td>{txn.paymentMethod || "N/A"}</td>
                <td>{txn?.accountDetails || "N/A"}</td>
                <td>${txn?.amount?.toFixed(2) || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No transactions found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MoneyTransaction;
