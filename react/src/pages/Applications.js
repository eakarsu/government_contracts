import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Building,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import formService from '../services/formService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Applications = () => {
  const [filter, setFilter] = useState('all');

  const { data: applications, isLoading } = useQuery(
    ['applications', filter],
    () => formService.getApplications({ status: filter })
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'draft':
        return <Clock className="text-yellow-600" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <p className="mt-2 text-gray-600">
          Track and manage your contract applications
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {['all', 'draft', 'submitted', 'awarded', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {applications && applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Link
                      to={`/contract/${application.contractId}`}
                      className="text-xl font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {application.contractTitle}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      Application ID: {application.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Calendar size={16} />
                      Submitted
                    </div>
                    <p className="font-medium">
                      {format(new Date(application.submittedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Building size={16} />
                      Agency
                    </div>
                    <p className="font-medium">{application.agency}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <DollarSign size={16} />
                      Contract Value
                    </div>
                    <p className="font-medium">{application.contractValue || 'TBD'}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <FileText size={16} />
                      Response Deadline
                    </div>
                    <p className="font-medium">
                      {format(new Date(application.deadline), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                {application.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">{application.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex gap-4 text-sm">
                    {application.documents?.map((doc, index) => (
                      <a
                        key={index}
                        href={doc.url}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Download size={16} />
                        {doc.name}
                      </a>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/applications/${application.id}`}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Eye size={16} />
                      View Details
                    </Link>
                    {application.status === 'draft' && (
                      <Link
                        to={`/form-generator/${application.contractId}?applicationId=${application.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Continue
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600 mb-4">
            Start searching for contracts and submit your first application
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search Contracts
          </Link>
        </div>
      )}
    </div>
  );
};

export default Applications;