// src/components/portfolio/TrackStockPerformance.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const TrackStockPerformance = ({ userId, stockId }) => {
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      const performanceData = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/transactions/${userId}/${stockId}`
      );

      setPerformance(performanceData);
    };

    fetchPerformance();
  }, [userId, stockId]);

  if (!performance) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3>Stock Performance</h3>
      <p>Symbol: {performance.stock.symbol}</p>
      <p>Name: {performance.stock.name}</p>
      <p>Total Quantity: {performance.stock.totalQuantity}</p>
      <p>Current Price: ${performance.stock.currentPrice}</p>
      <p>Average Purchase Price: ${performance.stock.averagePurchasePrice}</p>
      <p>Current Value: ${performance.stock.currentValue}</p>
      <p>Profit/Loss: ${performance.stock.performance}</p>
    </div>
  );
};

export default TrackStockPerformance;
