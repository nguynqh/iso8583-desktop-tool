import React from 'react';

interface ParsingExplanationProps {
  onClose: () => void;
}

export const ParsingExplanation: React.FC<ParsingExplanationProps> = ({ onClose }) => {
  return (
    <div className="mb-6 bg-white border rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">How ISO8583 Parsing Works</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-4 text-sm">
        <div>
          <h4 className="font-medium text-gray-800 mb-2">1. Message Format Recognition</h4>
          <p className="text-gray-600 mb-2">
            Our parser recognizes the simple format: <code className="bg-gray-100 px-1 rounded">MTI=0200,F2:value,F3:value...</code>
          </p>
          <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-400">
            <p><strong>MTI=0200</strong> → Message Type Indicator</p>
            <p><strong>F2:4532123456789012</strong> → Field 2 with value</p>
            <p><strong>F3:000000</strong> → Field 3 with value</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-2">2. MTI Interpretation</h4>
          <p className="text-gray-600 mb-2">
            The 4-digit MTI tells us what type of message this is:
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <strong>Position 1 - Version:</strong>
              <ul className="mt-1 space-y-1">
                <li>0 = ISO 8583-1:1987</li>
                <li>1 = ISO 8583-2:1993</li>
                <li>2 = ISO 8583-3:2003</li>
              </ul>
            </div>
            <div>
              <strong>Position 2 - Class:</strong>
              <ul className="mt-1 space-y-1">
                <li>1 = Authorization</li>
                <li>2 = Financial</li>
                <li>4 = Reversal</li>
                <li>8 = Network Management</li>
              </ul>
            </div>
            <div>
              <strong>Position 3 - Function:</strong>
              <ul className="mt-1 space-y-1">
                <li>0 = Request</li>
                <li>1 = Request Response</li>
                <li>2 = Advice</li>
                <li>3 = Advice Response</li>
              </ul>
            </div>
            <div>
              <strong>Position 4 - Origin:</strong>
              <ul className="mt-1 space-y-1">
                <li>0 = Acquirer</li>
                <li>1 = Acquirer Repeat</li>
                <li>2 = Issuer</li>
                <li>3 = Issuer Repeat</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-2">3. Field Processing</h4>
          <p className="text-gray-600 mb-2">
            Each field component (F2:value) is processed through these steps:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li><strong>Extract Field ID:</strong> Remove "F" prefix and convert to number</li>
            <li><strong>Extract Value:</strong> Everything after the ":" character</li>
            <li><strong>Template Lookup:</strong> Find field definition in JSON template</li>
            <li><strong>Enrich Field:</strong> Add name, description, type, max length</li>
            <li><strong>Calculate Length:</strong> Measure actual value length</li>
          </ol>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-2">4. Template-Based Enhancement</h4>
          <p className="text-gray-600 mb-2">
            Our JSON template provides rich metadata for each field:
          </p>
          <div className="bg-gray-50 p-3 rounded">
            <pre className="text-xs overflow-x-auto">{`{
  "FieldNumber": "2",
  "FieldType": "LLVAR",
  "FieldLength": "19", 
  "FieldPattern": "{6}-{4}-{4}-{4}",
  "FieldDescription": "Primary Account Number (PAN)"
}`}</pre>
          </div>
          <ul className="mt-2 space-y-1 text-gray-600">
            <li><strong>FieldType:</strong> Fixed, LLVAR, LLLVAR, Bitmap</li>
            <li><strong>FieldLength:</strong> Maximum allowed length</li>
            <li><strong>FieldPattern:</strong> Expected format (for validation)</li>
            <li><strong>FieldDescription:</strong> Human-readable name</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-2">5. Field Type Handling</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-blue-50 p-3 rounded">
              <strong className="text-blue-800">Fixed Length</strong>
              <p className="text-blue-600 mt-1">Must be exactly the specified length</p>
              <p className="text-blue-600">Example: STAN (6 digits)</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <strong className="text-green-800">LLVAR</strong>
              <p className="text-green-600 mt-1">Variable length, 2-digit length prefix</p>
              <p className="text-green-600">Example: PAN (up to 19 chars)</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <strong className="text-purple-800">LLLVAR</strong>
              <p className="text-purple-600 mt-1">Variable length, 3-digit length prefix</p>
              <p className="text-purple-600">Example: Additional Data</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-2">6. Parsing Example Walkthrough</h4>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="font-medium text-yellow-800 mb-2">Input: MTI=0200,F2:4532123456789012,F3:000000</p>
            <div className="space-y-2 text-yellow-700 text-xs">
              <p><strong>Step 1:</strong> Split by comma → ["MTI=0200", "F2:4532123456789012", "F3:000000"]</p>
              <p><strong>Step 2:</strong> Parse MTI=0200 → Financial Request from Acquirer</p>
              <p><strong>Step 3:</strong> Parse F2:4532123456789012 → Field 2 = "4532123456789012"</p>
              <p><strong>Step 4:</strong> Template lookup Field 2 → "Primary Account Number (PAN)"</p>
              <p><strong>Step 5:</strong> Parse F3:000000 → Field 3 = "000000"</p>
              <p><strong>Step 6:</strong> Template lookup Field 3 → "Processing Code"</p>
              <p><strong>Step 7:</strong> Apply validation rules to all fields</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};