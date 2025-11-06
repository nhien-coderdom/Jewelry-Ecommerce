"use client";
import PropTypes from "prop-types";

const SearchBox = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="w-full mb-5">
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search products..."
        className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-600"
      />
    </div>
  );
};

SearchBox.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
};

export default SearchBox;
