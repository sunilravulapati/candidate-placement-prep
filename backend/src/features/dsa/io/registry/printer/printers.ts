// backend/src/features/dsa/io/registry/printer/printers.ts

export interface TypePrinter {
  id: string;
  canonicalType: string;
  kind: 'primitive' | 'collection_array' | 'collection_matrix' | 'structure' | 'custom';
  elementType?: TypePrinter;
  description: string;
}
