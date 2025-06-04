import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { 
  FileText, 
  Save, 
  Send, 
  Download,
  AlertCircle,
  CheckCircle,
  Loader,
  Brain
} from 'lucide-react';
import formService from '../services/formService';
import contractService from '../services/contractService';
import { useCompany } from '../context/CompanyContext';
import FormField from '../components/forms/FormField';
import FormPreview from '../components/forms/FormPreview';

const FormGenerator = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { companyData } = useCompany();
  const [activeTab, setActiveTab] = useState('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState(null);
  const [formValues, setFormValues] = useState({});

  const { data: contract } = useQuery(
    ['contract', contractId],
    () => contractService.getContractDetails(contractId)
  );

  const handleGenerateForm = async () => {
    setIsGenerating(true);
    try {
      const response = await formService.generateForm(contractId);
      setFormData(response.formStructure);
      setFormValues(response.prefillData);
      setActiveTab('fill');
      toast.success('Form generated successfully!');
    } catch (error) {
      toast.error('Failed to generate form');
      console.error('Form generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await formService.saveDraft({
        contractId,
        formData,
        formValues,
        status: 'draft'
      });
      toast.success('Draft saved successfully!');
    } catch (error) {
      toast.error('Failed to save draft');
    }
  };

  const handleSubmitForm = async () => {
    try {
      const response = await formService.submitForm({
        contractId,
        formData,
        formValues,
        status: 'submitted'
      });
      toast.success('Application submitted successfully!');
      navigate('/applications');
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFormValues({
      ...formValues,
      [fieldName]: value
    });
  };

  const validateForm = () => {
    const requiredFields = formData?.fields?.filter(field => field.required) || [];
    const missingFields = requiredFields.filter(field => !formValues[field.name]);
    return missingFields.length === 0;
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Form Generator</h1>
            <p className="text-gray-600">
              Contract: {contract?.title}
            </p>
          </div>
          <div className="flex gap-3">
            {formData && (
              <>
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Save size={20} />
                  Save Draft
                </button>
                <button
                  onClick={handleSubmitForm}
                  disabled={!validateForm()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    validateForm()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send size={20} />
                  Submit Application
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'generate'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Generate Form
            </button>
            {formData && (
              <>
                <button
                  onClick={() => setActiveTab('fill')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'fill'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Fill Form
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'preview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Preview
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="p-6">
          {/* Generate Tab */}
          {activeTab === 'generate' && (
            <div className="max-w-2xl mx-auto text-center py-12">
              {isGenerating ? (
                <div>
                  <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                  <h3 className="text-lg font-semibold mb-2">Generating Form...</h3>
                  <p className="text-gray-600">
                    AI is analyzing contract requirements and creating a custom form
                  </p>
                </div>
              ) : (
                <div>
                  <Brain className="mx-auto mb-4 text-blue-600" size={64} />
                  <h3 className="text-xl font-semibold mb-4">Intelligent Form Generation</h3>
                  <p className="text-gray-600 mb-8">
                    Our AI will analyze the contract requirements and your company profile
                    to generate a pre-filled application form tailored to this opportunity.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
                    <h4 className="font-semibold text-blue-900 mb-2">What the AI will do:</h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="mt-0.5" />
                        <span>Extract all form requirements from contract documents</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="mt-0.5" />
                        <span>Pre-fill fields using your company profile data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="mt-0.5" />
                        <span>Suggest optimal responses based on winning proposals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="mt-0.5" />
                        <span>Highlight critical requirements and deadlines</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={handleGenerateForm}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Generate Form
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Fill Form Tab */}
          {activeTab === 'fill' && formData && (
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{formData.title}</h2>
                <p className="text-gray-600">{formData.description}</p>
              </div>

              <form className="space-y-6">
                {formData.sections?.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                    {section.description && (
                      <p className="text-gray-600 mb-4">{section.description}</p>
                    )}
                    
                    <div className="space-y-4">
                      {section.fields?.map((field, fieldIndex) => (
                        <FormField
                          key={fieldIndex}
                          field={field}
                          value={formValues[field.name] || ''}
                          onChange={(value) => handleFieldChange(field.name, value)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </form>

              {/* Form Actions */}
              <div className="mt-8 flex justify-between items-center">
                <div>
                  {!validateForm() && (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertCircle size={20} />
                      <span>Please fill in all required fields</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveDraft}
                    type="button"
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    type="button"
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && formData && (
            <FormPreview 
              formData={formData} 
              formValues={formValues}
              onSubmit={handleSubmitForm}
              onEdit={() => setActiveTab('fill')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FormGenerator;