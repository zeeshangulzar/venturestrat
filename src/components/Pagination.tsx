// components/Pagination.tsx
import React from 'react';

type PaginationProps = {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalItems: number;
};

const Pagination: React.FC<PaginationProps> = ({ currentPage, setCurrentPage, itemsPerPage, setItemsPerPage, totalPages, totalItems }) => {
  const handleNext = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="p-2 bg-blue-600 text-white rounded"
      >
        Prev
      </button>

      <span>
        Page {currentPage} of {totalPages} ({totalItems} items)
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="p-2 bg-blue-600 text-white rounded"
      >
        Next
      </button> */}

      <select
        value={itemsPerPage}
        onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
        className="p-2 border rounded"
      >
        <option value={20}>20</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </div>
  );
};

export default Pagination;
