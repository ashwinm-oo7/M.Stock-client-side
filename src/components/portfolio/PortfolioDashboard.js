// src/components/portfolio/PortfolioDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  CircularProgress,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const PortfolioDashboard = () => {
  const storedUser = localStorage.getItem("user");
  const user = JSON.parse(storedUser);
  const id = user?._id;
  console.log(id);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Search state

  const fetchPortfolioData = async () => {
    setLoading(true);
    setErrorMessage(""); // Reset any previous error messages
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/portfolio/holdings/${id}`
      );
      console.log(response);
      if (response.status === 200 && response.data) {
        const portfolioData = response.data;

        if (!portfolioData || !portfolioData.holdings) {
          throw new Error("Invalid portfolio data received.");
        }

        setPortfolio(portfolioData);
      } else {
        throw new Error("Failed to fetch portfolio data.");
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(
          error.response?.data?.message || "Error fetching portfolio data."
        );
      } else if (error.request) {
        setErrorMessage("Network error. Please check your connection.");
      } else {
        setErrorMessage(error.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false); // Stop loading when request is complete
    }
  };

  useEffect(() => {
    if (id) {
      fetchPortfolioData();
    }
  }, [id]);
  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };
  const filteredHoldings = portfolio?.holdings.filter((stock) =>
    stock.symbol.toLowerCase().includes(searchQuery)
  );

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading portfolio data...
        </Typography>
      </Container>
    );
  }

  if (errorMessage) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <Alert severity="error">{errorMessage}</Alert>
      </Container>
    );
  }

  if (!portfolio) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6">No portfolio data available.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Portfolio Dashboard
        </Typography>
        <Link to="/add-money-wallet" className="add-money-button">
          Add Money
        </Link>
      </Box>

      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h6" color="primary">
          Total Portfolio Value: ${portfolio.totalValue.toFixed(2)}
        </Typography>
        <TextField
          fullWidth
          placeholder="Search by stock symbol..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          sx={{ mb: 3 }}
        />
      </Box>

      <Typography variant="h5" gutterBottom>
        Stock Holdings
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Stock</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Purchase Price</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Quantity</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Current Price</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Current Value</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Profit/Loss</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHoldings && filteredHoldings.length > 0 ? (
              filteredHoldings.map((stock) => (
                <TableRow key={stock.stockId}>
                  <TableCell>{stock.symbol}</TableCell>
                  <TableCell align="right">{stock.purchasePrice}</TableCell>
                  <TableCell align="right">{stock.quantity}</TableCell>
                  <TableCell align="right">
                    ${stock.currentPrice.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    ${(stock.quantity * stock.currentPrice).toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{
                      color: stock.profitLoss >= 0 ? "green" : "red",
                    }}
                  >
                    {stock.profitLoss.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No stocks found for the search term.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default PortfolioDashboard;
