// backend/src/features/dsa/canonicalTypes.ts

export type SupportedLanguage = 'cpp' | 'java' | 'python' | 'javascript' | 'typescript';

export const ALL_SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'cpp',
  'java',
  'python',
  'javascript',
  'typescript',
];

export type BaseCanonicalType =
  | 'int'
  | 'long'
  | 'float'
  | 'double'
  | 'string'
  | 'bool'
  | 'char'
  | 'void';

export type ComplexCanonicalType =
  | 'ListNode'
  | 'TreeNode'
  | 'NArrayNode'
  | 'GraphNode'
  | 'Interval'
  | 'NestedInteger'
  | 'Node'
  | 'RandomNode'
  | 'Employee'
  | 'DesignSpec';

export type ProblemExecutionType =
  | 'FUNCTION'
  | 'CLASS'
  | 'DESIGN'
  | 'INTERACTIVE'
  | 'SQL'
  | 'SCRIPT'
  | 'CUSTOM';

export type DriverType =
  | 'DEFAULT'
  | 'LINKED_LIST'
  | 'TREE'
  | 'GRAPH'
  | 'COMMAND_SEQUENCE'
  | 'MATRIX'
  | 'INTERACTIVE'
  | 'SQL'
  | 'SCRIPT'
  | 'CUSTOM';

export type ComparatorType =
  | 'EXACT'
  | 'FLOATING_TOLERANCE'
  | 'UNORDERED_ARRAY'
  | 'MULTISET_ARRAY'
  | 'LINKED_LIST'
  | 'TREE'
  | 'GRAPH'
  | 'INTERVAL'
  | 'MATRIX'
  | 'NESTED_ARRAY'
  | 'DESIGN'
  | 'UNORDERED_SET'
  | 'CUSTOM';

export interface ParameterSpec {
  name: string;
  type: string; // Canonical type string, e.g. "array<int>", "matrix<string>", "ListNode*", "TreeNode*"
}

export interface DesignMethodSpec {
  name: string;
  parameters: ParameterSpec[];
  returnType: string;
}

export interface StarterMetadata {
  functionName: string;
  className?: string;
  parameters: ParameterSpec[];
  returnType: string; // Canonical type
  isStatic?: boolean;
  problemType?: ProblemExecutionType;
  methods?: DesignMethodSpec[];
  imports?: Record<SupportedLanguage, string[]>;
}

export interface ComparatorOptions {
  ignoreTrailingSpaces?: boolean;
  ignoreNewLines?: boolean;
  ignoreCase?: boolean;
  floatingPrecision?: number;
  customComparator?: string;
}

export interface ExecutionMetadata {
  inputType: string[]; // List of canonical types for inputs
  outputType: string;  // Canonical type for output
  serializer?: string;
  deserializer?: string;
  wrapper?: string;
  comparator: ComparatorType;
  floatingPrecision?: number;
  comparatorOptions?: ComparatorOptions;
  problemType?: ProblemExecutionType;
  timeLimit?: number; // seconds
  memoryLimit?: number; // MB
  expectedComplexity?: {
    time?: string;
    space?: string;
  };
}

export interface DriverMetadata {
  driver: DriverType;
  inputSerializers?: string[];
  outputSerializer?: string;
}

/**
 * Maps Canonical Types into target language type strings.
 */
export function mapCanonicalToLanguage(
  canonicalType: string,
  lang: SupportedLanguage
): string {
  const type = canonicalType.trim();

  // Matrix check: matrix<T> or vector<vector<T>>
  const matrixMatch = type.match(/^matrix<(.+)>$/) || type.match(/^vector<vector<(.+)>>$/) || type.match(/^(.+)\[\]\[\]$/);
  if (matrixMatch) {
    const inner = mapCanonicalToLanguage(matrixMatch[1], lang);
    switch (lang) {
      case 'cpp': return `vector<vector<${inner}>>`;
      case 'java': return `${inner}[][]`;
      case 'python': return `List[List[${inner}]]`;
      case 'javascript': return `${inner}[][]`;
      case 'typescript': return `${inner}[][]`;
    }
  }

  // Array check: array<T> or vector<T> or T[]
  const arrayMatch = type.match(/^array<(.+)>$/) || type.match(/^vector<(.+)>$/) || type.match(/^(.+)\[\]$/);
  if (arrayMatch) {
    const inner = mapCanonicalToLanguage(arrayMatch[1], lang);
    switch (lang) {
      case 'cpp': return `vector<${inner}>`;
      case 'java': return `${inner}[]`;
      case 'python': return `List[${inner}]`;
      case 'javascript': return `${inner}[]`;
      case 'typescript': return `${inner}[]`;
    }
  }

  // Pointer / Structure handling
  if (type === 'ListNode' || type === 'ListNode*') {
    switch (lang) {
      case 'cpp': return 'ListNode*';
      case 'java': return 'ListNode';
      case 'python': return 'Optional[ListNode]';
      case 'javascript': return 'ListNode';
      case 'typescript': return 'ListNode | null';
    }
  }

  if (type === 'TreeNode' || type === 'TreeNode*') {
    switch (lang) {
      case 'cpp': return 'TreeNode*';
      case 'java': return 'TreeNode';
      case 'python': return 'Optional[TreeNode]';
      case 'javascript': return 'TreeNode';
      case 'typescript': return 'TreeNode | null';
    }
  }

  if (type === 'Interval') {
    switch (lang) {
      case 'cpp': return 'vector<int>';
      case 'java': return 'int[]';
      case 'python': return 'List[int]';
      case 'javascript': return 'number[]';
      case 'typescript': return 'number[]';
    }
  }

  // Primitives
  switch (lang) {
    case 'cpp':
      switch (type) {
        case 'int': return 'int';
        case 'long': return 'long long';
        case 'float': return 'float';
        case 'double': return 'double';
        case 'string': return 'string';
        case 'bool': return 'bool';
        case 'char': return 'char';
        case 'void': return 'void';
        default: return type;
      }
    case 'java':
      switch (type) {
        case 'int': return 'int';
        case 'long': return 'long';
        case 'float': return 'float';
        case 'double': return 'double';
        case 'string': return 'String';
        case 'bool': return 'boolean';
        case 'char': return 'char';
        case 'void': return 'void';
        default: return type;
      }
    case 'python':
      switch (type) {
        case 'int': return 'int';
        case 'long': return 'int';
        case 'float': return 'float';
        case 'double': return 'float';
        case 'string': return 'str';
        case 'bool': return 'bool';
        case 'char': return 'str';
        case 'void': return 'None';
        default: return type;
      }
    case 'javascript':
    case 'typescript':
      switch (type) {
        case 'int':
        case 'long':
        case 'float':
        case 'double':
          return 'number';
        case 'string':
          return 'string';
        case 'bool':
          return 'boolean';
        case 'char':
          return 'string';
        case 'void':
          return 'void';
        default:
          return type;
      }
  }
}

