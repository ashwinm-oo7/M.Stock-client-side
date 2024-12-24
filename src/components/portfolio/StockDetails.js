import React, { useEffect, useState } from "react";
import axios from "../../services/apiPort";

const StockDetails = () => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const fetchStockPrices = async () => {
      try {
        const { data } = await axios.get("/stocks");
        setStocks(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStockPrices();
  }, []);

  return (
    <ul>
      {stocks.map((stock) => (
        <li key={stock.symbol}>
          {stock.symbol}: ${stock.currentPrice} ({stock.dailyChange}%)
        </li>
      ))}
    </ul>
  );
};

export default StockDetails;
