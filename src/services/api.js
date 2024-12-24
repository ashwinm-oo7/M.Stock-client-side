// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Backend running on localhost:4000
  timeout: 1000,
});

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error("Error registering:", error);
    throw error;
  }
};

export const fetchStockPrices = async () => {
  try {
    const response = await api.get("/stocks/prices");
    return response.data;
  } catch (error) {
    console.error("Error fetching stock prices:", error);
    throw error;
  }
};

// Add other API functions like add stock, get portfolio, etc.
