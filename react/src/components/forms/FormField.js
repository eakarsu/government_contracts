import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

const FormField = ({ field, value, onChange }) => {
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={field.rows || 4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              required={field.required}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={field.name} className="ml-2 text-sm text-gray-700">
              {field.checkboxLabel}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  required={field.required}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor={`${field.name}-${option.value}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <input
            type="file"
            id={field.name}
            name={field.name}
            onChange={(e) => onChange(e.target.files[0])}
            accept={field.accept}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
        {field.helpText && (
          <span className="ml-2 relative group">
            <HelpCircle size={16} className="inline-block text-gray-400 cursor-help" />
            <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg">
              {field.helpText}
            </span>
          </span>
        )}
      </label>
      
      {renderField()}
      
      {field.description && (
        <p className="mt-1 text-sm text-gray-500">{field.description}</p>
      )}
      
      {field.validation && !field.validation.isValid && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={16} />
          {field.validation.message}
        </p>
      )}
    </div>
  );
};

export default FormField;