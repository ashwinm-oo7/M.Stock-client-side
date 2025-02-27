import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // Back icon
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

import "../../css/StockDetailPage.css"; // Custom CSS for the page
import CandlestickChart from "./CandlestickChart";

const StockDetailPage = () => {
  const { id, symbol } = useParams(); // Get stock ID from URL
  const [stockDetails, setStockDetails] = useState(null);
  const [stockLiveDetail, setStockLiveDetail] = useState(null);
  const [activeTab, setActiveTab] = useState("pie");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRange, setSelectedRange] = useState(10); // Default limit to 10 data points

  const apiUrl = process.env.REACT_APP_API_URL;
  const colors = [
    "#2ecc71",
    "#3498db",
    "#e74c3c",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
    "#8e44ad",
    "#e67e22",
    "#d35400",
    "#c0392b",
  ];

  const hasFetched = useRef(false);
  useEffect(() => {
    const fetchStockDetails = async () => {
      if (hasFetched.current) return; // Prevent second run
      hasFetched.current = true;

      try {
        const response = await axios.get(`${apiUrl}/stocks/stock-detail/${id}`);
        setStockDetails(response?.data);
        console.log("Stock Live details: ", response?.data);
        if (response?.data) {
          console.log("Stock Live ", response?.data?.priceHistory);
          setStockLiveDetail(response?.data?.priceHistory || []);
        }

        setLoading(false);
      } catch (err) {
        setError("Error fetching stock details. Please try again later.");
        setLoading(false);
      }
    };

    fetchStockDetails();
    // eslint-disable-next-line
  }, [id, symbol]);

  useEffect(() => {
    const fetchStockLiveDetails = async () => {
      try {
        const liveStockResponse = await axios.get(
          `${apiUrl}/stocks/getLiveStockPrice/${symbol}`
        );

        if (liveStockResponse.status === 200 && liveStockResponse.data) {
          console.log("Live Stock Price Fetched:", liveStockResponse.data);
        } else {
          console.warn(
            "Unexpected response format for live stock price:",
            liveStockResponse
          );
        }
      } catch (error) {
        if (error.response) {
          // Server responded with an error status
          console.error(
            "API Error:",
            error.response.status,
            error.response.data
          );
        } else if (error.request) {
          // Request was made but no response received
          console.error(
            "No response received from server. Possible network issue."
          );
        } else {
          // Something else happened in setting up the request
          console.error("Unexpected error:", error.message);
        }
      }
    };
    fetchStockLiveDetails();
    // eslint-disable-next-line
  }, [id, symbol]);

  // If data is still loading or there's an error
  if (loading) return <div className="loading">Loading stock details...</div>;
  if (error) return <div className="error">{error}</div>;

  // Prepare the data for the chart (simple example using line chart)
  // const priceHistory = stockDetails?.priceHistory || [];
  const filteredData = stockLiveDetail.slice(-selectedRange);

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
      <div className="tabs">
        {["pie", "line", "bar", "candlestick"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Chart
          </button>
        ))}
      </div>

      <div className="stock-performance">
        <h3>Price Performance (Price History)</h3>
        <div className="filter-section">
          <label>Select Data Range: </label>
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(Number(e.target.value))}
          >
            <option value={1}>Last 1 Days</option>
            <option value={5}>Last 5 Days</option>
            <option value={10}>Last 10 Days</option>
            <option value={20}>Last 20 Days</option>
            <option value={45}>Last 45 Days</option>
          </select>
        </div>
        <div className="chart-container">
          {activeTab === "pie" && (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={filteredData}
                  dataKey="close"
                  nameKey="date"
                  fill="#8884d8"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {filteredData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                // payload={filteredData.map((entry, index) => ({
                //   value: `${entry.date} - Close: $${entry.close}`,
                //   type: "square",
                //   color: colors[index % colors.length],
                // }))}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {activeTab === "line" && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredData}>
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
                  dataKey="close"
                  stroke="#8884d8"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          {activeTab === "bar" && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="close"
                  fill={({ payload }) =>
                    payload.open < payload.close ? "#2ecc71" : "#e74c3c"
                  }
                >
                  {filteredData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeTab === "candlestick" && (
            <CandlestickChart
              key={Math.random()}
              stockLiveDetail={filteredData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetailPage;
