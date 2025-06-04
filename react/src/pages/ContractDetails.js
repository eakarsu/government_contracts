import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Calendar, 
  DollarSign, 
  Building, 
  MapPin, 
  FileText, 
  Download, 
  ExternalLink,
  Brain,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import contractService from '../services/contractService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const ContractDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: contract, isLoading } = useQuery(
    ['contract', id],
    () => contractService.getContractDetails(id)
  );

  const { data: analysis, isLoading: analysisLoading } = useQuery(
    ['contractAnalysis', id],
    () => contractService.getContractAnalysis(id),
    { enabled: !!contract }
  );

  const handleProcessDocuments = async () => {
    try {
      await contractService.processContractDocuments(id);
      toast.success('Documents processed successfully!');
    } catch (error) {
      toast.error('Failed to process documents');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!contract) return <div>Contract not found</div>;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents' },
    { id: 'analysis', label: 'AI Analysis' },
    { id: 'requirements', label: 'Requirements' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{contract.title}</h1>
            <p className="text-gray-600">
              Notice ID: {contract.noticeId} | Solicitation: {contract.solicitationNumber}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/form-generator/${id}`}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generate Application
            </Link>
            <button
              onClick={handleProcessDocuments}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Process Documents
            </button>
          </div>
        </div>

        {/* Key Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Calendar size={16} />
              Response Deadline
            </div>
            <p className="font-semibold">
              {format(new Date(contract.responseDeadline), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <DollarSign size={16} />
              Contract Value
            </div>
            <p className="font-semibold">{contract.contractValue || 'Not specified'}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Building size={16} />
              Agency
            </div>
            <p className="font-semibold">{contract.agency}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <MapPin size={16} />
              Place of Performance
            </div>
            <p className="font-semibold">{contract.placeOfPerformance}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{contract.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contract Details</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Type</dt>
                      <dd className="font-medium">{contract.type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Set-Aside</dt>
                      <dd className="font-medium">{contract.setAside || 'None'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">NAICS Code</dt>
                      <dd className="font-medium">{contract.naicsCode}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Posted Date</dt>
                      <dd className="font-medium">
                        {format(new Date(contract.postedDate), 'MMM dd, yyyy')}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Primary Contact</dt>
                      <dd className="font-medium">{contract.primaryContact?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Email</dt>
                      <dd className="font-medium">{contract.primaryContact?.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Phone</dt>
                      <dd className="font-medium">{contract.primaryContact?.phone}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Attached Documents</h3>
              {contract.attachments?.length > 0 ? (
                <div className="space-y-3">
                  {contract.attachments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="text-gray-400" size={24} />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.size} • {doc.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.processed && (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle size={16} />
                            Processed
                          </span>
                        )}
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <Download size={16} />
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No documents attached to this contract.</p>
              )}
            </div>
          )}

          {/* AI Analysis Tab */}
          {activeTab === 'analysis' && (
            <div>
              {analysisLoading ? (
                <LoadingSpinner />
              ) : analysis ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Brain className="text-blue-600" />
                      AI Contract Analysis
                    </h3>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Match Score: {analysis.matchScore}%</h4>
                      <p className="text-blue-800">{analysis.matchReason}</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Key Requirements</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {analysis.keyRequirements?.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Recommended Action</h4>
                        <p className="text-gray-700">{analysis.recommendation}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Potential Challenges</h4>
                        <ul className="space-y-2">
                          {analysis.challenges?.map((challenge, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertCircle className="text-yellow-500 mt-0.5" size={16} />
                              <span className="text-gray-700">{challenge}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No analysis available yet.</p>
              )}
            </div>
          )}

          {/* Requirements Tab */}
          {activeTab === 'requirements' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Contract Requirements</h3>
              <div className="space-y-4">
                {contract.requirements?.map((req, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">{req.title}</h4>
                    <p className="text-gray-700 text-sm">{req.description}</p>
                    {req.mandatory && (
                      <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                        Mandatory
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractDetails;