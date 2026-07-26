// backend/src/features/dsa/io/registry/parser/parsers.ts

export interface TypeParser {
  id: string;
  canonicalType: string;
  kind: 'primitive' | 'collection_array' | 'collection_matrix' | 'structure' | 'custom';
  elementType?: TypeParser;
  description: string;
}
