// src/context/StockContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const StockContext = createContext();

const StockProvider = ({ children }) => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get("/api/stocks/getAllStock");
        setStocks(response.data);
      } catch (error) {
        console.error("Failed to fetch stocks:", error);
      }
    };

    fetchStocks();
  }, []);

  return (
    <StockContext.Provider value={{ stocks }}>{children}</StockContext.Provider>
  );
};

export { StockContext, StockProvider };
