import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import SearchBar from '../components/search/SearchBar';
import contractService from '../services/contractService';
import { Loader } from 'lucide-react';

const SearchContracts = () => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    dateFrom: null,
    dateTo: null,
    naicsCode: '',
    setAside: '',
    placeOfPerformance: '',
    agency: '',
    minValue: '',
    maxValue: '',
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const handleSearch = async (params) => {
    setIsSearching(true);
    try {
      const results = await contractService.searchContracts(params);
      setSearchResults(results);
    } catch (error) {
      toast.error('Search failed. Please try again.');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveSearch = async () => {
    try {
      await contractService.saveSearch({
        ...searchParams,
        name: `Search - ${new Date().toLocaleDateString()}`
      });
      toast.success('Search saved successfully!');
    } catch (error) {
      toast.error('Failed to save search.');
    }
  };

  const handleIndexContracts = async (dateRange) => {
    try {
      await contractService.indexContracts(dateRange);
      toast.success('Contracts indexed successfully!');
    } catch (error) {
      toast.error('Failed to index contracts.');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Contracts</h1>
        <p className="text-gray-600">Find government contracts matching your capabilities</p>
      </div>

      {/* Search Bar */}
      <SearchBar
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        onSearch={() => handleSearch(searchParams)}
        onSaveSearch={handleSaveSearch}
      />

      {/* Filters and Results */}
      <div className="flex gap-8 mt-8">
        {/* Filters Sidebar */}
        <div className="w-80">
          <SearchFilters
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            onSearch={() => handleSearch(searchParams)}
            onIndexContracts={handleIndexContracts}
          />
        </div>

        {/* Results Area */}
        <div className="flex-1">
          {isSearching ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="animate-spin text-blue-600" size={48} />
            </div>
          ) : searchResults ? (
            <SearchResults results={searchResults} />
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">
                Enter search criteria to find relevant contracts
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchContracts;