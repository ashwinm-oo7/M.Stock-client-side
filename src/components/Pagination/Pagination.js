// src/components/Pagination.js
import React from "react";
import PropTypes from "prop-types";
import "../../css/Pagination.css";
const Pagination = ({
  currentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  setResponseValue,
  itemsPerPage,
  setCurrentPage,
  handleItemsPerPageChange,
}) => {
  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisiblePages = 5; // Adjust maxVisiblePages if needed
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }

    return visiblePages;
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 0",
        }}
      >
        <strong style={{ marginLeft: "" }}>
          Item :{indexOfFirstItem + 1} -{" "}
          {Math.min(indexOfLastItem, setResponseValue.length)} of{" "}
          {setResponseValue.length}
        </strong>
        <strong style={{ marginLeft: "" }}>Current Page : {currentPage}</strong>
      </div>
      <div className="items-per-page">
        <label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            disabled={setResponseValue.length < 1}
          >
            <option value={1}>1 items-per-page</option>
            <option value={2}>2 items-per-page</option>
            <option value={5}>5 items-per-page</option>
            <option value={10}>10 items-per-page</option>
            <option value={20}>20 items-per-page</option>
            <option value={50}>50 items-per-page</option>
          </select>
        </label>
      </div>
      <div className="pagination" style={{ paddingBottom: "10px" }}>
        <button
          style={{ width: "" }}
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={currentPage === 1 ? "disabled" : "pagination-button"}
          title={currentPage - 1 + " is Prev Page"}
        >
          {"<<"}
        </button>
        {getVisiblePages().map((page) => (
          <button
            key={page}
            // onClick={() => setCurrentPage(page)}
            onClick={() => {
              setCurrentPage(page);
              window.scrollTo(0, 0); // Scroll to top when changing pages
            }}
            className={
              currentPage === page
                ? "active pagination-button"
                : "pagination-button"
            }
          >
            {page}
          </button>
        ))}
        <button
          style={{ width: "" }}
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={indexOfLastItem >= setResponseValue.length}
          className={
            indexOfLastItem >= setResponseValue.length
              ? "disabled"
              : "pagination-button"
          }
          title={currentPage + 1 + " is Next Page"}
        >
          {">>"}
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
};

export default Pagination;
