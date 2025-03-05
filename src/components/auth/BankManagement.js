import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/BankManagement.css";

const BankManagement = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [branch, setBranch] = useState("");
  useEffect(() => {
    fetchBankAccounts();
  }, []);

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
      console.error("Error fetching bank accounts", error);
    }
  };
  useEffect(() => {
    // Fetch bank list from backend
    axios
      .get(`${process.env.REACT_APP_API_URL}/bank/banks`)
      .then((response) => {
        setBanks(response.data.banks);
      })
      .catch((error) => {
        console.error("Error fetching banks:", error);
      });
  }, []);
  const handleBankChange = (e) => {
    const selectedBankName = e.target.value;
    setSelectedBank(selectedBankName);

    // Find the selected bank and auto-fill IFSC Code
    const bank = banks.find((b) => b.name === selectedBankName);
    if (bank) {
      setIfscCode(bank.ifscCode || "");
      setCity(bank.city || "");
      setState(bank.state || "");
      setBranch(bank.branch || "");
    } else {
      setIfscCode("");
      setCity("");
      setState("");
    }
  };

  const handleAddBankAccount = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        setErrorMessage("User not authenticated");
        return;
      }
      if (!selectedBank || !accountNumber || !ifscCode) {
        setErrorMessage("All fields are required.");
        return;
      }
      if (!validateIfscCode(ifscCode)) {
        setErrorMessage("Invalid IFSC Code format.");
        return;
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/bank/bank-accounts`,
        {
          bankName: selectedBank,
          branch,
          accountNumber,
          ifscCode,
          city,
          state,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`, // Ensure 'Bearer ' is included
          },
        }
      );
      fetchBankAccounts();
      setAccountNumber("");
      setIfscCode("");
      setSelectedBank("");
      setCity("");
      setState("");
      setErrorMessage("");
    } catch (error) {
      console.error("Error adding bank account", error);
    }
  };
  const validateIfscCode = (ifsc) => {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/bank/bank-accounts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      fetchBankAccounts();
    } catch (error) {
      console.error("Error deleting bank account", error);
    }
  };
  const handleAccountNumberChange = (e) => {
    const value = e.target.value;

    if (!/^[0-9]*$/.test(value)) {
      setErrorMessage("Only numeric values allowed!");
      return;
    }

    if (value.length > 18) {
      setErrorMessage("Account Number should not exceed 18 digits.");
      return;
    }

    setAccountNumber(value);
    setErrorMessage("");
  };
  return (
    <div className="bank-management-container">
      <h2>Manage Bank Accounts</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="bank-form">
        <h2>Choose Your Bank</h2>
        <select onChange={handleBankChange}>
          <option value="">Select a Bank</option>
          {banks.map((bank) => (
            <option key={bank._id} value={bank.name}>
              {bank.name} ({bank.city}, {bank.state})
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Account Number"
          value={accountNumber}
          onChange={handleAccountNumberChange}
          maxLength="18"
        />
        <input type="text" placeholder="IFSC Code" value={ifscCode} readOnly />
        <button onClick={handleAddBankAccount}>Add Bank Account</button>
      </div>
      <ul className="bank-list">
        {bankAccounts.map((account) => (
          <li key={account._id}>
            <span>
              {account.bankName} - {account.accountNumber}
            </span>
            <button onClick={() => handleDelete(account._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BankManagement;
