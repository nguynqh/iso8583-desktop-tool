export interface ParsedField {
  id: number;
  name: string;
  value: string;
}

export interface ParsedMessage {
  mti: string;
  fields: ParsedField[];
}