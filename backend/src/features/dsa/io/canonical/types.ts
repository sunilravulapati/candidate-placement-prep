// backend/src/features/dsa/io/canonical/types.ts

import { SupportedLanguage, StarterMetadata, ParameterSpec, mapCanonicalToLanguage } from '../../canonicalTypes';

export type { SupportedLanguage, StarterMetadata, ParameterSpec };
export { mapCanonicalToLanguage };

export type PrimitiveCanonicalType =
  | 'int'
  | 'long'
  | 'float'
  | 'double'
  | 'bool'
  | 'char'
  | 'string'
  | 'void';

export type StructureCanonicalType =
  | 'ListNode'
  | 'TreeNode'
  | 'GraphNode'
  | 'Interval'
  | 'Pair'
  | 'NestedInteger';

export interface ParsedCanonicalType {
  raw: string;
  kind: 'primitive' | 'collection_array' | 'collection_matrix' | 'structure' | 'custom';
  baseType: string;
  elementType?: ParsedCanonicalType;
}

export function parseCanonicalType(rawType: string): ParsedCanonicalType {
  const trimmed = rawType.trim();

  // Matrix check: matrix<T> or vector<vector<T>> or T[][]
  const matrixMatch =
    trimmed.match(/^matrix<(.+)>$/i) ||
    trimmed.match(/^vector<vector<(.+)>>$/i) ||
    trimmed.match(/^(.+)\[\]\[\]$/);
  if (matrixMatch) {
    const inner = parseCanonicalType(matrixMatch[1]);
    return {
      raw: trimmed,
      kind: 'collection_matrix',
      baseType: 'matrix',
      elementType: inner,
    };
  }

  // Array check: array<T> or vector<T> or T[]
  const arrayMatch =
    trimmed.match(/^array<(.+)>$/i) ||
    trimmed.match(/^vector<(.+)>$/i) ||
    trimmed.match(/^(.+)\[\]$/);
  if (arrayMatch) {
    const inner = parseCanonicalType(arrayMatch[1]);
    return {
      raw: trimmed,
      kind: 'collection_array',
      baseType: 'array',
      elementType: inner,
    };
  }

  // Pointer / normalized Structure check
  const normStruct = trimmed.replace(/\*$/, '');
  if (
    normStruct === 'ListNode' ||
    normStruct === 'TreeNode' ||
    normStruct === 'GraphNode' ||
    normStruct === 'Interval' ||
    normStruct === 'Pair' ||
    normStruct === 'NestedInteger'
  ) {
    return {
      raw: trimmed,
      kind: 'structure',
      baseType: normStruct,
    };
  }

  // Primitives
  const primitives = ['int', 'long', 'float', 'double', 'bool', 'char', 'string', 'void'];
  if (primitives.includes(normStruct.toLowerCase())) {
    return {
      raw: trimmed,
      kind: 'primitive',
      baseType: normStruct.toLowerCase(),
    };
  }

  return {
    raw: trimmed,
    kind: 'custom',
    baseType: normStruct,
  };
}
