// src/services/api.js
import axios from "axios";

const API_URL = "http://localhost:4000/api/portfolio";

// Helper function to handle errors
const handleError = (error) => {
  console.error("API call error:", error);
  return { error: error.response ? error.response.data : "Unknown error" };
};

// Get the portfolio holdings and total value
export const getPortfolioHoldings = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/holdings/${userId}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Get total portfolio value
export const getPortfolioValue = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/value/${userId}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Add stock to portfolio
export const addStockToPortfolio = async (userId, stockId, quantity) => {
  try {
    const response = await axios.post(`${API_URL}/add`, {
      userId,
      stockId,
      quantity,
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Track stock performance
export const trackStockPerformance = async (userId, stockId) => {
  try {
    const response = await axios.get(
      `${API_URL}/performance/${userId}/${stockId}`
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};
