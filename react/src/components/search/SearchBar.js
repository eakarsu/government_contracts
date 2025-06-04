import React from 'react';
import { Search, Save } from 'lucide-react';

const SearchBar = ({ searchParams, setSearchParams, onSearch, onSaveSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by keywords, NAICS codes, or requirements..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchParams.query}
            onChange={(e) => setSearchParams({ ...searchParams, query: e.target.value })}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Search size={20} />
          Search
        </button>
        <button
          type="button"
          onClick={onSaveSearch}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Save size={20} />
          Save Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;