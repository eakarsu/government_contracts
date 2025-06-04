import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Building, FileText, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const SearchResults = ({ results }) => {
  if (!results || results.contracts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No contracts found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Found {results.totalCount} contracts
        </h2>
        <div className="text-sm text-gray-600">
          AI Relevance Score: {results.averageRelevance}%
        </div>
      </div>

      <div className="space-y-4">
        {results.contracts.map((contract) => (
          <div key={contract.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link 
                    to={`/contract/${contract.id}`}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {contract.title}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    Notice ID: {contract.noticeId} | Solicitation: {contract.solicitationNumber}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {contract.relevanceScore}% Match
                  </div>
                  {contract.aiInsight && (
                    <p className="text-xs text-gray-500 mt-1">AI Recommended</p>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">
                {contract.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>Due: {format(new Date(contract.responseDeadline), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign size={16} />
                  <span>{contract.contractValue || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building size={16} />
                  <span>{contract.agency}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText size={16} />
                  <span>{contract.attachments?.length || 0} documents</span>
                </div>
              </div>

              {contract.aiSummary && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">AI Summary</h4>
                  <p className="text-sm text-blue-700">{contract.aiSummary}</p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {contract.setAside && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      {contract.setAside}
                    </span>
                  )}
                  {contract.type && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {contract.type}
                    </span>
                  )}
                </div>
                <Link
                  to={`/contract/${contract.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  View Details
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {results.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex gap-2">
            {[...Array(results.totalPages)].map((_, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded ${
                  results.currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default SearchResults;