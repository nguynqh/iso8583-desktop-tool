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
  description: string;
  fieldType: string; // Fixed, LLVAR, LLLVAR, Bitmap
  maxLength: number; // Maximum allowed length
  actualLength: number; // Current value length
  pattern: string; // Expected pattern
  isValid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationError[];
  parseMethod: string; // How this field was parsed
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
  mtiDescription: string;
  fields: ParsedField[];
  fieldCount: number;
  templateName: string;
  isValid: boolean;
  validationSummary: ValidationSummary;
  parsedAt: string;
  parsingMethod: string; // Simple, Advanced, etc.
}

export interface TemplateStats {
  totalFields: number;
  fieldTypes: { [key: string]: number };
}