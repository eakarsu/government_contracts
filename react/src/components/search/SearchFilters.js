import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, DollarSign, Building, MapPin, RefreshCw } from 'lucide-react';

const SearchFilters = ({ searchParams, setSearchParams, onSearch, onIndexContracts }) => {
  const [indexDateRange, setIndexDateRange] = useState({
    from: new Date(),
    to: new Date()
  });

  const agencies = [
    'Department of Defense',
    'Department of Health and Human Services',
    'Department of Veterans Affairs',
    'Department of Homeland Security',
    'General Services Administration',
    'NASA',
    'Department of Energy',
  ];

  const setAsideOptions = [
    'Total Small Business Set-Aside',
    '8(a) Set-Aside',
    'Woman Owned Small Business',
    'Service-Disabled Veteran-Owned',
    'HUBZone Set-Aside',
  ];

  const handleIndexClick = () => {
    onIndexContracts(indexDateRange);
  };

  return (
    <div className="space-y-6">
      {/* Index New Contracts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <RefreshCw size={20} />
          Index New Contracts
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <DatePicker
              selected={indexDateRange.from}
              onChange={(date) => setIndexDateRange({ ...indexDateRange, from: date })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <DatePicker
              selected={indexDateRange.to}
              onChange={(date) => setIndexDateRange({ ...indexDateRange, to: date })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            onClick={handleIndexClick}
            className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Index Contracts
          </button>
        </div>
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Filters</h3>
        
        {/* Date Range */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} />
            Posted Date Range
          </h4>
          <div className="space-y-2">
            <DatePicker
              selected={searchParams.dateFrom}
              onChange={(date) => setSearchParams({ ...searchParams, dateFrom: date })}
              placeholderText="From date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <DatePicker
              selected={searchParams.dateTo}
              onChange={(date) => setSearchParams({ ...searchParams, dateTo: date })}
              placeholderText="To date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Contract Value */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <DollarSign size={16} />
            Contract Value
          </h4>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Min value"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={searchParams.minValue}
              onChange={(e) => setSearchParams({ ...searchParams, minValue: e.target.value })}
            />
            <input
              type="number"
              placeholder="Max value"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={searchParams.maxValue}
              onChange={(e) => setSearchParams({ ...searchParams, maxValue: e.target.value })}
            />
          </div>
        </div>

        {/* Agency */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Building size={16} />
            Agency
          </h4>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={searchParams.agency}
            onChange={(e) => setSearchParams({ ...searchParams, agency: e.target.value })}
          >
            <option value="">All Agencies</option>
            {agencies.map(agency => (
              <option key={agency} value={agency}>{agency}</option>
            ))}
          </select>
        </div>

        {/* Set-Aside */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Set-Aside Type</h4>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={searchParams.setAside}
            onChange={(e) => setSearchParams({ ...searchParams, setAside: e.target.value })}
          >
            <option value="">All Types</option>
            {setAsideOptions.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Place of Performance */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MapPin size={16} />
            Place of Performance
          </h4>
          <input
            type="text"
            placeholder="State or ZIP code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={searchParams.placeOfPerformance}
            onChange={(e) => setSearchParams({ ...searchParams, placeOfPerformance: e.target.value })}
          />
        </div>

        <button
          onClick={onSearch}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;