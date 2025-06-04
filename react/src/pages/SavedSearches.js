import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  Bell, 
  Trash2, 
  Edit, 
  Play,
  Pause,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import contractService from '../services/contractService';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SavedSearches = () => {
  const [activeSearchId, setActiveSearchId] = useState(null);

  const { data: searches, isLoading, refetch } = useQuery(
    'savedSearches',
    () => contractService.getSavedSearches()
  );

  const deleteMutation = useMutation(
    (searchId) => contractService.deleteSearch(searchId),
    {
      onSuccess: () => {
        toast.success('Search deleted successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete search');
      }
    }
  );

  const toggleAlertMutation = useMutation(
    ({ searchId, enabled }) => contractService.toggleSearchAlert(searchId, enabled),
    {
      onSuccess: () => {
        toast.success('Alert settings updated');
        refetch();
      },
      onError: () => {
        toast.error('Failed to update alert settings');
      }
    }
  );

  const runSearch = async (search) => {
    setActiveSearchId(search.id);
    try {
      const results = await contractService.searchContracts(search.criteria);
      // Navigate to search page with results
    } catch (error) {
      toast.error('Failed to run search');
    } finally {
      setActiveSearchId(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Saved Searches</h1>
        <p className="mt-2 text-gray-600">
          Manage your saved searches and configure alerts for new matches
        </p>
      </div>

      {searches && searches.length > 0 ? (
        <div className="grid gap-6">
          {searches.map((search) => (
            <div key={search.id} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{search.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Created on {format(new Date(search.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlertMutation.mutate({ 
                        searchId: search.id, 
                        enabled: !search.alertEnabled 
                      })}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        search.alertEnabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Bell size={16} />
                      {search.alertEnabled ? 'Alerts On' : 'Alerts Off'}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Search Criteria</h4>
                  <div className="flex flex-wrap gap-2">
                    {search.criteria.query && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        Keywords: {search.criteria.query}
                      </span>
                    )}
                    {search.criteria.agency && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        Agency: {search.criteria.agency}
                      </span>
                    )}
                    {search.criteria.setAside && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {search.criteria.setAside}
                      </span>
                    )}
                    {search.criteria.naicsCode && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                        NAICS: {search.criteria.naicsCode}
                      </span>
                    )}
                    {(search.criteria.minValue || search.criteria.maxValue) && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        Value: ${search.criteria.minValue || '0'} - ${search.criteria.maxValue || 'Any'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>Last run: {search.lastRun ? format(new Date(search.lastRun), 'MMM dd') : 'Never'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Search size={16} />
                      <span>{search.matchCount || 0} matches found</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runSearch(search)}
                      disabled={activeSearchId === search.id}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {activeSearchId === search.id ? (
                        <>
                          <Pause size={16} />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          Run Search
                        </>
                      )}
                    </button>
                    <Link
                      to={`/search?savedId=${search.id}`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Edit size={20} />
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this search?')) {
                          deleteMutation.mutate(search.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {search.alertEnabled && search.recentMatches && search.recentMatches.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Matches</h4>
                    <div className="space-y-2">
                      {search.recentMatches.slice(0, 3).map((match) => (
                        <Link
                          key={match.id}
                          to={`/contract/${match.id}`}
                          className="block p-3 bg-gray-50 rounded hover:bg-gray-100"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">{match.title}</p>
                              <p className="text-xs text-gray-500">
                                {match.agency} • Due {format(new Date(match.responseDeadline), 'MMM dd')}
                              </p>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved searches</h3>
          <p className="text-gray-600 mb-4">
            Save your searches to get alerts when new matching contracts are posted
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Search size={20} />
            Create New Search
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedSearches;