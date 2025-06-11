import React from 'react';
import { ParsedMessage } from '../types/iso8583';

interface MessageTableProps {
  message: ParsedMessage;
  messageIndex?: number;
}

export const MessageTable: React.FC<MessageTableProps> = ({ 
  message, 
  messageIndex = 0 
}) => {
  return (
    <div className="mb-8 border border-gray-200 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Message {messageIndex + 1} - MTI: {message.mti}
        </h3>
        <p className="text-sm text-gray-600">
          {message.fields.length} fields found
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">
                Field ID
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">
                Name
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {message.fields.map((field) => (
              <tr key={field.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 font-mono text-blue-600">
                  {field.id}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-gray-700">
                  {field.name}
                </td>
                <td className="border border-gray-300 px-3 py-2 font-mono text-sm break-all">
                  {field.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};