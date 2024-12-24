import React, { useState } from "react";
import axios from "axios";
import "../../css/AddMoney.css"; // Import the CSS file

const AddMoney = () => {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [walletBalance, setWalletBalance] = useState(null);

  const handleAddMoney = async () => {
    try {
      setMessage("");
      setError("");

      const userId = localStorage.getItem("userId"); // Get userId from storage or auth context
      if (!userId) {
        setError("User not logged in.");
        return;
      }

      if (!amount || amount <= 0) {
        setError("Please enter a valid amount.");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/razorpay/add-money`,
        { userId, amount: parseFloat(amount) }
      );
      console.log(response);
      setMessage(response.data.message);
      setWalletBalance(response.data.walletBalance);
      setAmount(""); // Reset the input field
    } catch (error) {
      console.error("Error adding money:", error);
      setError("Failed to add money. Please try again.");
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
        />
        <button onClick={handleAddMoney} className="add-money-button">
          Add Money
        </button>
      </div>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      {walletBalance !== null && (
        <p className="balance-message">
          Your new wallet balance: ${walletBalance.toFixed(2)}
        </p>
      )}
    </div>
  );
};

export default AddMoney;
