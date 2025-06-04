import React, { useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { toast } from 'react-toastify';
import { 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  FileText,
  Shield,
  Award,
  Save,
  Edit
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CompanyProfile = () => {
  const { companyData, loading, updateCompanyData } = useCompany();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(companyData || {});

  const handleInputChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    });
  };

  const handleAddItem = (section, item) => {
    setFormData({
      ...formData,
      [section]: [...(formData[section] || []), item]
    });
  };

  const handleRemoveItem = (section, index) => {
    setFormData({
      ...formData,
      [section]: formData[section].filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateCompanyData(formData);
    if (result.success) {
      toast.success('Company profile updated successfully!');
      setIsEditing(false);
    } else {
      toast.error(result.error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-600 mt-1">
            Keep your company information up to date for accurate form generation
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isEditing ? <Save size={20} /> : <Edit size={20} />}
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Building size={24} />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.basicInfo?.companyName || ''}
                onChange={(e) => handleInputChange('basicInfo', 'companyName', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Legal Business Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.basicInfo?.legalName || ''}
                onChange={(e) => handleInputChange('basicInfo', 'legalName', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DUNS Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.basicInfo?.dunsNumber || ''}
                onChange={(e) => handleInputChange('basicInfo', 'dunsNumber', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CAGE Code
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.basicInfo?.cageCode || ''}
                onChange={(e) => handleInputChange('basicInfo', 'cageCode', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID (EIN)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.basicInfo?.taxId || ''}
                onChange={(e) => handleInputChange('basicInfo', 'taxId', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Established
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.basicInfo?.yearEstablished || ''}
                onChange={(e) => handleInputChange('basicInfo', 'yearEstablished', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Mail size={24} />
            Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.contactInfo?.email || ''}
                onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.contactInfo?.phone || ''}
                onChange={(e) => handleInputChange('contactInfo', 'phone', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.contactInfo?.website || ''}
                onChange={(e) => handleInputChange('contactInfo', 'website', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fax Number
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.contactInfo?.fax || ''}
                onChange={(e) => handleInputChange('contactInfo', 'fax', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <MapPin size={24} />
            Address Information
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address?.street || ''}
                onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.address?.city || ''}
                  onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.address?.state || ''}
                  onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.address?.zip || ''}
                  onChange={(e) => handleInputChange('address', 'zip', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.address?.country || ''}
                  onChange={(e) => handleInputChange('address', 'country', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Classifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Shield size={24} />
            Business Classifications
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Small Business',
              'Woman-Owned Small Business',
              '8(a) Business Development',
              'HUBZone',
              'Service-Disabled Veteran-Owned',
              'Veteran-Owned Small Business',
              'Minority-Owned Business',
              'Disadvantaged Business Enterprise'
            ].map((classification) => (
              <label key={classification} className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.classifications?.includes(classification) || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleInputChange('classifications', null, 
                        [...(formData.classifications || []), classification]
                      );
                    } else {
                      handleInputChange('classifications', null,
                        formData.classifications.filter(c => c !== classification)
                      );
                    }
                  }}
                  disabled={!isEditing}
                />
                <span className="text-sm">{classification}</span>
              </label>
            ))}
          </div>
        </div>

        {/* NAICS Codes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileText size={24} />
            NAICS Codes
          </h2>
          
          {isEditing && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Add NAICS code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem('naicsCodes', e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {formData.naicsCodes?.map((code, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
              >
                {code}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('naicsCodes', index)}
                    className="text-blue-800 hover:text-blue-900"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Past Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Award size={24} />
            Past Performance
          </h2>
          
          <div className="space-y-3">
            {formData.pastPerformance?.map((performance, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{performance.projectName}</h4>
                    <p className="text-sm text-gray-600">{performance.agency}</p>
                    <p className="text-sm text-gray-500">
                      {performance.contractValue} • {performance.period}
                    </p>
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('pastPerformance', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Save Company Profile
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CompanyProfile;