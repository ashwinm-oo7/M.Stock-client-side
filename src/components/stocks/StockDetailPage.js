import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // Back icon
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"; // Recharts components
import "../../css/StockDetailPage.css"; // Custom CSS for the page

const StockDetailPage = () => {
  const { id, symbol } = useParams(); // Get stock ID from URL
  const [stockDetails, setStockDetails] = useState(null);
  const [stockLiveDetail, setStockLiveDetail] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  const hasFetched = useRef(false);
  useEffect(() => {
    const fetchStockDetails = async () => {
      if (hasFetched.current) return; // Prevent second run
      hasFetched.current = true;

      try {
        const response = await axios.get(`${apiUrl}/stocks/stock-detail/${id}`);
        setStockDetails(response.data);
        console.log("Stock Live details: ", response.data);
        if (response?.data) {
          console.log("Stock Live ", response.data.priceHistory);
          setStockLiveDetail(response.data.priceHistory);
        }
        await axios.get(`${apiUrl}/stocks/getLiveStockPrice/${symbol}`);

        setLoading(false);
      } catch (err) {
        setError("Error fetching stock details. Please try again later.");
        setLoading(false);
      }
    };

    fetchStockDetails();
    // eslint-disable-next-line
  }, [id, symbol]);

  // If data is still loading or there's an error
  if (loading) return <div className="loading">Loading stock details...</div>;
  // if (error) return <div className="error">{error}</div>;

  // Prepare the data for the chart (simple example using line chart)
  const priceHistory = stockDetails?.priceHistory || [];

  return (
    <div className="stock-detail-page">
      <div className="back-button">
        <a href="/" className="back-btn">
          <FaArrowLeft /> Back to Stocks
        </a>
      </div>

      <h1 className="pageh1 stock-title">
        {stockDetails.name} ({stockDetails.symbol})
      </h1>

      <div className="stock-info">
        <p>
          <strong>Current Price:</strong>{" "}
          <span className="price">${stockDetails.currentPrice}</span>
        </p>
        <p>
          <strong>Daily Change:</strong>{" "}
          <span className="daily-change">${stockDetails.dailyChange}</span>
        </p>

        <p>
          <strong>Open:</strong>{" "}
          <span className="open">
            ${stockLiveDetail && stockLiveDetail[0]?.open}
          </span>
        </p>
        <p>
          <strong>High:</strong>{" "}
          <span className="high">
            ${stockLiveDetail && stockLiveDetail[0]?.high}
          </span>
        </p>
        <p>
          <strong>Low:</strong>{" "}
          <span className="low">
            ${stockLiveDetail && stockLiveDetail[0]?.low}
          </span>
        </p>
        <p>
          <strong>Volume:</strong>{" "}
          <span className="volume">
            {stockLiveDetail && stockLiveDetail[0]?.volume}
          </span>
        </p>
      </div>

      <div className="stock-performance">
        <h3>Price Performance (Price History)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockDetailPage;
