"use client"

import { SchemaAnalyzer } from "@/components/schema-analyzer"

export default function SchemaAnalyzerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Phân tích log theo schema/template tùy chỉnh</h1>
              <p className="text-gray-600">Phân tích log theo schema template tùy chỉnh</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <SchemaAnalyzer />
      </div>
    </div>
  )
}
