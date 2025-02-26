// src/components/Pagination.js
import React from "react";
import PropTypes from "prop-types";
import "../../css/Pagination.css";
const LimitPagination = ({
  totalstock,
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
          {/* Item :{indexOfFirstItem + 1} -{" "}
          {Math.min(indexOfLastItem, setResponseValue.length)} of{" "}
          {setResponseValue.length} */}
          Item : {indexOfFirstItem + 1} -{" "}
          {/* {Math.min(indexOfLastItem, totalPages * itemsPerPage)} of{" "}
          {totalPages * itemsPerPage} */}
          {Math.min(indexOfLastItem, totalstock)} of {totalstock}
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
          // onClick={() => setCurrentPage(currentPage - 1)}
          onClick={() => {
            setCurrentPage(currentPage - 1);
            window.scrollTo(0, 0); // Scroll to top on page change
          }}
          disabled={currentPage === 1}
          className={currentPage === 1 ? "disabled" : "pagination-button"}
          title={
            currentPage === 1 ? "First Page" : `Go to Page ${currentPage - 1}`
          }
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
          // onClick={() => setCurrentPage(currentPage + 1)}
          onClick={() => {
            setCurrentPage(currentPage + 1);
            window.scrollTo(0, 0); // Scroll to top on page change
          }}
          // disabled={indexOfLastItem >= setResponseValue.length}
          disabled={currentPage >= totalPages} // Fix: Disable only on the last page
          // className={
          //   indexOfLastItem >= setResponseValue.length
          //     ? "disabled"
          //     : "pagination-button"
          // }
          className={
            currentPage >= totalPages ? "disabled" : "pagination-button"
          }
          title={
            currentPage < totalPages
              ? `Go to Page ${currentPage + 1}`
              : "Last Page"
          }
        >
          {">>"}
        </button>
      </div>
    </div>
  );
};

LimitPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  indexOfFirstItem: PropTypes.number.isRequired,
  indexOfLastItem: PropTypes.number.isRequired,
  setResponseValue: PropTypes.array.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  handleItemsPerPageChange: PropTypes.func.isRequired,
};

export default LimitPagination;
