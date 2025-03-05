import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../css/WithdrawMoney.css";
const WithdrawMoney = () => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [accountDetails, setAccountDetails] = useState("");
  const [bankAccounts, setBankAccounts] = useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [walletBalance, setWalletBalance] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      navigate("/");
    } else {
      fetchBankAccounts();
    }
  }, [navigate]);
  const fetchBankAccounts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/bank/bank-accounts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setBankAccounts(response.data);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };
  const handleWithdrawMoney = async () => {
    try {
      setMessage("");
      setError("");
      setLoading(true);

      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User not logged in.");
        setLoading(false);

        return;
      }

      if (!amount || amount <= 0 || !accountDetails) {
        setError("Please enter a valid amount and details.");
        setLoading(false);

        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/money/withdraw-money`,
        { userId, amount: parseFloat(amount), paymentMethod, accountDetails }
      );

      setMessage(response?.data?.message);
      setWalletBalance(response?.data?.walletBalance);
      setAmount("");
      setAccountDetails("");
    } catch (error) {
      console.error("Error withdrawing money:", error);
      setError(error.response?.data?.message || "Failed to withdraw money.");
    }
    setLoading(false);
  };

  return (
    <div className="withdraw-container">
      <h2 className="text-lg font-bold">Withdraw Money from Your Wallet</h2>
      <div className="mt-2">
        <label className="block font-medium">Amount ($)</label>
        <input
          type="number"
          value={amount}
          min={1}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="withdraw-container-input"
          disabled={loading}
        />
      </div>
      <div className="mt-2">
        <label className="block font-medium">Payment Method</label>
        <select
          value={paymentMethod}
          onChange={(e) => {
            setPaymentMethod(e.target.value);
            setAccountDetails(""); // Reset account details on method change
          }}
          className="border p-2 w-full rounded"
        >
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="UPI">UPI</option>
        </select>
      </div>
      {paymentMethod === "Bank Transfer" && (
        <div className="mt-2">
          <label className="block font-medium">Select Bank Account</label>
          <select
            value={accountDetails}
            onChange={(e) => setAccountDetails(e.target.value)}
            className="border p-2 w-full rounded"
          >
            <option value="">Select a Bank Account</option>
            {bankAccounts.map((account) => (
              <option
                key={account._id}
                value={`${account.bankName} - ${account.accountNumber}`}
              >
                {account.bankName} ({account.accountNumber})
              </option>
            ))}
          </select>
        </div>
      )}

      {paymentMethod === "UPI" && (
        <div className="mt-2">
          <label className="block font-medium">Enter UPI ID</label>
          <input
            type="text"
            value={accountDetails}
            onChange={(e) => setAccountDetails(e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Enter your UPI ID"
          />
        </div>
      )}
      <button
        onClick={handleWithdrawMoney}
        className="withdraw-money-button mt-4 bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600"
        disabled={
          loading || !amount || parseFloat(amount) <= 0 || !accountDetails
        }
      >
        {loading ? "Processing..." : "Withdraw Money"}
      </button>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      {walletBalance !== null && (
        <p className="balance-message">
          Your current wallet balance: ${walletBalance?.toFixed(2)}
        </p>
      )}
    </div>
  );
};

export default WithdrawMoney;
