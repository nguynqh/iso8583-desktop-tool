import React from 'react';

interface ValidationGuideProps {
  onClose: () => void;
}

export const ValidationGuide: React.FC<ValidationGuideProps> = ({ onClose }) => {
  return (
    <div className="mb-6 bg-white border rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Validation Rules & Logic</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-4 text-sm">
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Validation Categories</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="flex items-center mb-2">
                <span className="text-red-500 text-lg mr-2">❌</span>
                <strong className="text-red-800">Errors</strong>
              </div>
              <p className="text-red-700 text-xs">
                Critical validation failures that make the field invalid
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="flex items-center mb-2">
                <span className="text-yellow-500 text-lg mr-2">⚠️</span>
                <strong className="text-yellow-800">Warnings</strong>
              </div>
              <p className="text-yellow-700 text-xs">
                Potential issues that don't invalidate the field but need attention
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-2">Length Validation</h4>
          <div className="bg-gray-50 p-3 rounded">
            <div className="space-y-2 text-xs">
              <div><strong>Fixed Length Fields:</strong> Must match exactly (ERROR if different)</div>
              <div><strong>Variable Length Fields:</strong> Must not exceed maximum (ERROR if over)</div>
              <div><strong>Example:</strong> STAN (Field 11) must be exactly 6 digits</div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-2">Type Validation</h4>
          <div className="space-y-2">
            <div className="bg-blue-50 p-3 rounded">
              <strong className="text-blue-800">Numeric Fields</strong>
              <p className="text-blue-600 text-xs mt-1">
                Amount fields, dates, times, STAN - must contain only digits 0-9
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <strong className="text-green-800">Hexadecimal Fields</strong>
              <p className="text-green-600 text-xs mt-1">
                Bitmap (Field 1) - must contain only 0-9, A-F characters
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <strong className="text-purple-800">Text Fields</strong>
              <p className="text-purple-600 text-xs mt-1">
                Check for control characters, ensure printable characters only
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-2">Pattern Validation</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <strong>MMDDhhmmss</strong>
              <span className="text-gray-600">10-digit date-time format</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <strong>hhmmss</strong>
              <span className="text-gray-600">6-digit time format</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <strong>MMDD</strong>
              <span className="text-gray-600">4-digit month-day format</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <strong>YYMM</strong>
              <span className="text-gray-600">4-digit year-month format</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-2">Field-Specific Validation</h4>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-400 pl-3">
              <strong className="text-blue-800">Field 2 - PAN (Primary Account Number)</strong>
              <ul className="mt-1 space-y-1 text-xs text-blue-600">
                <li>• Must be 13-19 digits long</li>
                <li>• If masked, should follow pattern: XXXXXX****XXXX</li>
                <li>• Luhn algorithm validation (if unmasked)</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-green-400 pl-3">
              <strong className="text-green-800">Field 3 - Processing Code</strong>
              <ul className="mt-1 space-y-1 text-xs text-green-600">
                <li>• Must be exactly 6 digits</li>
                <li>• First 2 digits: transaction type</li>
                <li>• Middle 2 digits: account type from</li>
                <li>• Last 2 digits: account type to</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-400 pl-3">
              <strong className="text-purple-800">Field 39 - Response Code</strong>
              <ul className="mt-1 space-y-1 text-xs text-purple-600">
                <li>• Must be exactly 2 characters</li>
                <li>• Validate against known response codes</li>
                <li>• 00 = Approved, 51 = Insufficient funds, etc.</li>
              </ul>
            </div>

            <div className="border-l-4 border-red-400 pl-3">
              <strong className="text-red-800">Field 11 - STAN</strong>
              <ul className="mt-1 space-y-1 text-xs text-red-600">
                <li>• Must be exactly 6 digits</li>
                <li>• Should be unique per terminal per day</li>
                <li>• Used for transaction tracking</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-2">Validation Scoring</h4>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded border">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <strong>Fields Coverage:</strong>
                <p className="text-gray-600">% of fields with template definitions</p>
              </div>
              <div>
                <strong>Validation Score:</strong>
                <p className="text-gray-600">% of fields passing all validations</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <strong>Score Calculation:</strong> (Valid Fields / Total Fields) × 100
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-2">Common Validation Examples</h4>
          <div className="space-y-2 text-xs">
            <div className="bg-red-50 border-l-4 border-red-400 p-2">
              <strong className="text-red-700">❌ Length Error:</strong> STAN "12345" (5 digits, expected 6)
            </div>
            <div className="bg-red-50 border-l-4 border-red-400 p-2">
              <strong className="text-red-700">❌ Type Error:</strong> Amount "12A3" (contains letter)
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2">
              <strong className="text-yellow-700">⚠️ Format Warning:</strong> PAN masking "123456***1234" (unusual pattern)
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2">
              <strong className="text-yellow-700">⚠️ Unknown Warning:</strong> Response code "99" (uncommon code)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};