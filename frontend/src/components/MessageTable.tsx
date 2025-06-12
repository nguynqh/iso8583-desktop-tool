import React, { useState } from 'react';
import { ParsedMessage, ParsedField, ValidationSummary, ValidationError } from '../types/iso8583';

interface MessageTableProps {
  message: ParsedMessage;
  messageIndex?: number;
}

// Validation Summary Component
const ValidationSummaryComponent: React.FC<{ summary: ValidationSummary }> = ({ summary }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100 border-green-300';
    if (score >= 70) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  return (
    <div className="mb-4 p-4 bg-white border rounded-lg shadow-sm">
      <h4 className="font-medium text-gray-800 mb-3">📊 Validation Summary</h4>
      
      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{summary.totalFields}</div>
          <div className="text-xs text-gray-600">Total Fields</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{summary.validFields}</div>
          <div className="text-xs text-gray-600">Valid Fields</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{summary.errorCount}</div>
          <div className="text-xs text-gray-600">Errors</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{summary.warningCount}</div>
          <div className="text-xs text-gray-600">Warnings</div>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className={`p-3 rounded border ${getScoreBackground(summary.validationScore)}`}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Validation Score</span>
            <span className={`text-lg font-bold ${getScoreColor(summary.validationScore)}`}>
              {summary.validationScore.toFixed(1)}%
            </span>
          </div>
          <div className="mt-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${summary.validationScore >= 90 ? 'bg-green-500' : summary.validationScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${summary.validationScore}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className={`p-3 rounded border ${getScoreBackground(summary.fieldsCoverage)}`}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Template Coverage</span>
            <span className={`text-lg font-bold ${getScoreColor(summary.fieldsCoverage)}`}>
              {summary.fieldsCoverage.toFixed(1)}%
            </span>
          </div>
          <div className="mt-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${summary.fieldsCoverage >= 90 ? 'bg-green-500' : summary.fieldsCoverage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${summary.fieldsCoverage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Issues */}
      {(summary.unknownFields && summary.unknownFields.length > 0) && (
        <div className="mb-2 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
          <p className="text-blue-800 text-sm font-medium">Unknown Fields (not in template):</p>
          <p className="text-blue-700 text-sm">
            Fields {summary.unknownFields.join(', ')} are not defined in the current template
          </p>
        </div>
      )}

      {(summary.missingRequired && summary.missingRequired.length > 0) && (
        <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
          <p className="text-red-800 text-sm font-medium">Missing Required Fields:</p>
          <p className="text-red-700 text-sm">
            Required fields {summary.missingRequired.join(', ')} are missing from this message
          </p>
        </div>
      )}
    </div>
  );
};

// Validation Status Icon
const getValidationStatusIcon = (field: ParsedField) => {
  if (field.errors && field.errors.length > 0) {
    return <span className="text-red-500 font-bold text-lg" title={`${field.errors.length} errors`}>❌</span>;
  }
  if (field.warnings && field.warnings.length > 0) {
    return <span className="text-yellow-500 font-bold text-lg" title={`${field.warnings.length} warnings`}>⚠️</span>;
  }
  if (field.isValid) {
    return <span className="text-green-500 font-bold text-lg" title="Valid">✅</span>;
  }
  return <span className="text-gray-400 text-lg" title="Unknown status">❓</span>;
};

// Validation Detail Component
const ValidationDetails: React.FC<{ errors: ValidationError[], warnings: ValidationError[] }> = ({ errors, warnings }) => {
  return (
    <div className="space-y-1">
      {errors.map((error, idx) => (
        <div key={`error-${idx}`} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
          <div className="flex justify-between items-start">
            <div>
              <strong>{error.errorType}:</strong> {error.message}
            </div>
            <span className="text-xs text-red-400 ml-2">{error.ruleApplied}</span>
          </div>
          {error.expected !== error.actual && (
            <div className="mt-1 text-xs">
              Expected: <code className="bg-red-100 px-1 rounded">{error.expected}</code> | 
              Actual: <code className="bg-red-100 px-1 rounded">{error.actual}</code>
            </div>
          )}
        </div>
      ))}
      
      {warnings.map((warning, idx) => (
        <div key={`warning-${idx}`} className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
          <div className="flex justify-between items-start">
            <div>
              <strong>{warning.errorType}:</strong> {warning.message}
            </div>
            <span className="text-xs text-yellow-400 ml-2">{warning.ruleApplied}</span>
          </div>
          {warning.expected !== warning.actual && (
            <div className="mt-1 text-xs">
              Expected: <code className="bg-yellow-100 px-1 rounded">{warning.expected}</code> | 
              Actual: <code className="bg-yellow-100 px-1 rounded">{warning.actual}</code>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const MessageTable: React.FC<MessageTableProps> = ({ 
  message, 
  messageIndex = 0 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedField, setExpandedField] = useState<number | null>(null);
  const [showOnlyInvalid, setShowOnlyInvalid] = useState(false);
  const [sortBy, setSortBy] = useState<'id' | 'status' | 'name'>('id');

  // Filter and sort fields
  const filteredFields = message.fields
    .filter(field => {
      const matchesSearch = field.id.toString().includes(searchTerm) ||
        field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.value.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesValidation = !showOnlyInvalid || !field.isValid;
      
      return matchesSearch && matchesValidation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'id':
          return a.id - b.id;
        case 'status':
          // Sort by validation status: errors first, then warnings, then valid
          const aStatus = a.errors?.length ? 0 : a.warnings?.length ? 1 : 2;
          const bStatus = b.errors?.length ? 0 : b.warnings?.length ? 1 : 2;
          return aStatus - bStatus;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const copyFieldValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      // You can add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleFieldExpansion = (fieldId: number) => {
    setExpandedField(expandedField === fieldId ? null : fieldId);
  };

  const getFieldTypeColor = (fieldType: string) => {
    switch (fieldType) {
      case 'Fixed': return 'bg-blue-100 text-blue-800';
      case 'LLVAR': return 'bg-green-100 text-green-800';
      case 'LLLVAR': return 'bg-purple-100 text-purple-800';
      case 'Bitmap': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="mb-8 border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Message Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-3">
              <span>Message {messageIndex + 1}</span>
              <span className="text-gray-400">•</span>
              <span className="font-mono text-blue-600">{message.mti}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm font-normal text-gray-600">{message.mtiDescription}</span>
              {message.isValid ? (
                <span className="text-green-500 text-2xl" title="Message is valid">✅</span>
              ) : (
                <span className="text-red-500 text-2xl" title="Message has validation errors">❌</span>
              )}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span>{message.fieldCount} fields found</span>
              <span>•</span>
              <span>Template: {message.templateName}</span>
              <span>•</span>
              <span>Parsed: {message.parsedAt}</span>
              <span>•</span>
              <span>Method: {message.parsingMethod}</span>
            </div>
          </div>
        </div>
        
        {/* Validation Summary */}
        <ValidationSummaryComponent summary={message.validationSummary} />
        
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search fields by ID, name, or value..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'id' | 'status' | 'name')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="id">Sort by Field ID</option>
            <option value="status">Sort by Validation Status</option>
            <option value="name">Sort by Field Name</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showOnlyInvalid}
                onChange={(e) => setShowOnlyInvalid(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span>Show only invalid fields</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border-b border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                Status
              </th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                Field ID
              </th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                Field Name & Info
              </th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                Value & Length
              </th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                Validation Details
              </th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredFields.map((field, index) => (
              <tr key={field.id} className={`hover:bg-gray-50 ${!field.isValid ? 'bg-red-25' : ''} ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                {/* Status Column */}
                <td className="border-b border-gray-100 px-4 py-3 text-center">
                  {getValidationStatusIcon(field)}
                </td>
                
                {/* Field ID Column */}
                <td className="border-b border-gray-100 px-4 py-3">
                  <div className="font-mono text-lg font-bold text-blue-600">{field.id}</div>
                  {field.fieldType && (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getFieldTypeColor(field.fieldType)}`}>
                      {field.fieldType}
                    </span>
                  )}
                </td>
                
                {/* Name Column */}
                <td className="border-b border-gray-100 px-4 py-3">
                  <div className="font-medium text-gray-900">{field.name}</div>
                  {field.description && field.description !== field.name && (
                    <div className="text-xs text-gray-500 mt-1">{field.description}</div>
                  )}
                  {field.pattern && (
                    <div className="text-xs text-purple-600 mt-1">
                      Pattern: <code className="bg-purple-50 px-1 rounded">{field.pattern}</code>
                    </div>
                  )}
                </td>
                
                {/* Value Column */}
                <td className="border-b border-gray-100 px-4 py-3">
                  <div className="font-mono text-sm break-all bg-gray-50 p-2 rounded">
                    {field.value.length > 60 ? (
                      <>
                        {expandedField === field.id 
                          ? field.value 
                          : `${field.value.substring(0, 60)}...`
                        }
                        <button
                          onClick={() => toggleFieldExpansion(field.id)}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                        >
                          {expandedField === field.id ? 'Show Less' : 'Show More'}
                        </button>
                      </>
                    ) : (
                      field.value
                    )}
                  </div>
                  
                  {/* Length Info */}
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-gray-500">
                      Length: <span className="font-medium">{field.actualLength}</span>
                      {field.maxLength > 0 && (
                        <>
                          /<span className="font-medium">{field.maxLength}</span>
                          <span className={`ml-1 ${field.actualLength > field.maxLength ? 'text-red-600' : 'text-green-600'}`}>
                            ({field.actualLength > field.maxLength ? 'over' : 'ok'})
                          </span>
                        </>
                      )}
                    </span>
                    {field.parseMethod && (
                      <span className="text-gray-400">via {field.parseMethod}</span>
                    )}
                  </div>
                </td>
                
                {/* Validation Column */}
                <td className="border-b border-gray-100 px-4 py-3">
                  {(field.errors?.length || field.warnings?.length) ? (
                    <ValidationDetails errors={field.errors || []} warnings={field.warnings || []} />
                  ) : (
                    <div className="text-green-600 text-xs font-medium">✅ All validations passed</div>
                  )}
                </td>
                
                {/* Actions Column */}
                <td className="border-b border-gray-100 px-4 py-3">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => copyFieldValue(field.value)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded transition-colors"
                      title="Copy field value"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={() => copyFieldValue(`F${field.id}:${field.value}`)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
                      title="Copy field component"
                    >
                      📄 Copy F${field.id}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Results */}
      {filteredFields.length === 0 && (searchTerm || showOnlyInvalid) && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>No fields found matching current filters</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setShowOnlyInvalid(false);
            }}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Table Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-600">
        <div className="flex justify-between items-center">
          <span>Showing {filteredFields.length} of {message.fields.length} fields</span>
          <span>Validation completed in real-time</span>
        </div>
      </div>
    </div>
  );
};