import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/AddMoney.css"; // Import the CSS file
import { useNavigate } from "react-router-dom";
import MoneyTransaction from "../transactions/MoneyTransaction";

const AddMoney = () => {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [walletBalance, setWalletBalance] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // 🚀 Disable button while processing

  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      navigate("/"); // Redirect to dashboard or another page
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
  useEffect(() => {
    if (bankAccounts.length > 0) {
      setSelectedBank(
        `${bankAccounts[0].bankName} - ${bankAccounts[0].accountNumber}`
      );
    }
  }, [bankAccounts]);
  const handleAddMoney = async () => {
    try {
      setMessage("");
      setError("");
      if (loading) return;
      setLoading(true);

      const userId = localStorage.getItem("userId"); // Get userId from storage or auth context
      if (!userId) {
        setError("User not logged in.");
        return;
      }

      if (!amount || amount <= 0 || !selectedBank) {
        setError("Please enter a valid amount and select a bank.");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/razorpay/add-money`,
        { userId, amount: parseFloat(amount), bankAccount: selectedBank }
      );
      console.log("razorpay/add-money", response);
      if (response.status === 200) {
        setMessage(response.data.message);
        setWalletBalance(response.data.walletBalance);
      }
      setAmount(""); // Reset the input field
      setSelectedBank("");
    } catch (err) {
      console.error("Error adding money:", err);
      if (err.response?.data?.message) {
        setError(err?.response?.data?.message);
      } else if (err?.message) {
        setError(err?.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false); // **✅ Re-enable button after API call completes**
    }
  };

  return (
    <div className="add-money-container">
      <h2 className="money-header">Add Money to Your Wallet</h2>
      <div className="input-container">
        <input
          type="number"
          value={amount}
          min={1}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="input-field"
          disabled={loading}
        />
        <div className="mt-2">
          <label className="">Select Bank Account</label>

          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="input-field"
          >
            <option value="">Select Bank Account</option>
            {bankAccounts.length === 0 ? (
              <option value="">No Bank Accounts Available</option>
            ) : (
              bankAccounts.map((bank) => (
                <option
                  key={bank._id}
                  value={`${bank.bankName} - ${bank.accountNumber}`}
                >
                  {bank.bankName} ({bank.accountNumber})
                </option>
              ))
            )}
          </select>
        </div>

        <button
          onClick={handleAddMoney}
          className={`add-money-button ${
            loading ? "add-money-button-disabled" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Processing..." : "Add Money"}
        </button>
      </div>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      {walletBalance !== null && (
        <p className="balance-message">
          Your new wallet balance: ${walletBalance.toFixed(2)}
        </p>
      )}
      <div>
        <MoneyTransaction />
      </div>
    </div>
  );
};

export default AddMoney;
