import React from 'react';
import { Download, Edit, Send } from 'lucide-react';
import { format } from 'date-fns';

const FormPreview = ({ formData, formValues, onSubmit, onEdit }) => {
  const exportToPDF = () => {
    // Implementation for PDF export
    console.log('Exporting to PDF...');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">{formData.title}</h2>
          <p className="text-gray-600">Application Preview</p>
        </div>

        <div className="space-y-8 mb-8">
          {formData.sections?.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <dl className="grid grid-cols-1 gap-4">
                {section.fields?.map((field, fieldIndex) => {
                  const value = formValues[field.name];
                  if (!value) return null;

                  return (
                    <div key={fieldIndex}>
                      <dt className="text-sm font-medium text-gray-700">{field.label}</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {field.type === 'file' ? (
                          <span className="text-blue-600">{value.name}</span>
                        ) : field.type === 'checkbox' ? (
                          value ? 'Yes' : 'No'
                        ) : field.type === 'select' || field.type === 'radio' ? (
                          field.options?.find(opt => opt.value === value)?.label || value
                        ) : (
                          value
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded p-4 mb-8">
          <h4 className="font-medium mb-2">Submission Information</h4>
          <p className="text-sm text-gray-600">
            By submitting this application, you certify that all information provided is accurate and complete.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Submission Date: {format(new Date(), 'MMMM dd, yyyy HH:mm')}
          </p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={20} />
            Export PDF
          </button>
          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit size={20} />
              Edit
            </button>
            <button
              onClick={onSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Send size={20} />
              Submit Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;