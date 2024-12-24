import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // Import the necessary chart.js module
import { format, startOfWeek, parseISO } from "date-fns"; // Import date-fns functions

const StockHistory = ({ symbol }) => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("daily"); // Default view is daily

  useEffect(() => {
    const fetchStockHistory = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/stocks/getLiveStockPrice/${symbol}`
        );
        console.log(response);
        setHistory(response.data.history);
      } catch (err) {
        setError("Error fetching stock history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStockHistory();
  }, [symbol]);

  const handleViewChange = (view) => {
    setView(view);
  };

  // Group the data based on the selected view
  const groupData = (data) => {
    if (view === "daily") return data; // No grouping needed for daily

    const grouped = data.reduce(
      (acc, { date, open, high, low, close, volume }) => {
        const formattedDate = parseISO(date); // Parse ISO string to Date object
        let key;

        // Group by week, month, or year
        if (view === "weekly") {
          key = format(startOfWeek(formattedDate), "yyyy-MM-dd");
        } else if (view === "monthly") {
          key = format(formattedDate, "yyyy-MM");
        } else if (view === "yearly") {
          key = format(formattedDate, "yyyy");
        }

        // If key doesn't exist in accumulator, create a new entry
        if (!acc[key]) {
          acc[key] = { date: key, open, high, low, close, volume, count: 1 };
        } else {
          acc[key].open += open;
          acc[key].high = Math.max(acc[key].high, high);
          acc[key].low = Math.min(acc[key].low, low);
          acc[key].close += close;
          acc[key].volume += volume;
          acc[key].count += 1;
        }

        return acc;
      },
      {}
    );

    // Convert grouped data to an array and calculate averages
    const groupedData = Object.keys(grouped).map((key) => {
      const entry = grouped[key];
      entry.open = entry.open / entry.count;
      entry.close = entry.close / entry.count;
      entry.volume = entry.volume / entry.count;
      delete entry.count; // Remove the count property
      return entry;
    });

    return groupedData;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const groupedHistory = groupData(history); // Group the data based on the selected view
  console.log("Grouped History: ", groupedHistory);

  // Extract the labels and data for the chart
  const dates = groupedHistory.map((data) => data.date);
  const prices = groupedHistory.map((data) => data.close);

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: `Closing Prices of ${symbol}`,
        data: prices,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div>
      <h2>{symbol} Stock Price History</h2>

      {/* View Selector */}
      <div>
        <button onClick={() => handleViewChange("daily")}>Daily</button>
        <button onClick={() => handleViewChange("weekly")}>Weekly</button>
        <button onClick={() => handleViewChange("monthly")}>Monthly</button>
        <button onClick={() => handleViewChange("yearly")}>Yearly</button>
      </div>

      {/* Chart */}
      <Line data={chartData} />
    </div>
  );
};

export default StockHistory;
