export interface Message{
  Content: string;
  Description: string;
}

export interface ValidationError {
  fieldId: number;
  fieldName: string;
  errorType: string; // "length", "type", "format", "pattern", "missing"
  expected: string;
  actual: string;
  severity: string; // "error", "warning", "info"
  message: string;
  ruleApplied: string; // Which validation rule was applied
}

export interface ParsedField {
  id: number;
  name: string;
  value: string;
  fieldType: string;
  maxLength: number;
  actualLength: number;
  pattern: string;
  isValid: boolean;
  error?: string;
}

export interface ValidationSummary {
  totalFields: number;
  validFields: number;
  errorCount: number;
  warningCount: number;
  fieldsCoverage: number; // % of fields with template definitions
  validationScore: number; // Overall validation score (0-100)
  missingRequired?: number[];
  unknownFields?: number[]; // Fields not in template
}

export interface ParsedMessage {
  mti: string;
  format: string;
  fields: ParsedField[];
  isValid: boolean;
  errorCount: number;
  parsedAt: string;
}

export interface TemplateStats {
  totalFields: number;
  fieldTypes: { [key: string]: number };
}