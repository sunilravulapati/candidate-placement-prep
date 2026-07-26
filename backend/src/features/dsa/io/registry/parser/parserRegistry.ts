// backend/src/features/dsa/io/registry/parser/parserRegistry.ts

import { TypeParser } from './parsers';
import { parseCanonicalType } from '../../canonical/types';

export class ParserRegistry {
  private static instance: ParserRegistry;
  private parsers = new Map<string, TypeParser>();
  private patternParsers: Array<{
    pattern: RegExp;
    factory: (typeStr: string, match: RegExpMatchArray) => TypeParser;
  }> = [];

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): ParserRegistry {
    if (!ParserRegistry.instance) {
      ParserRegistry.instance = new ParserRegistry();
    }
    return ParserRegistry.instance;
  }

  public register(typeKey: string, parser: TypeParser): void {
    const key = typeKey.trim().toLowerCase();
    this.parsers.set(key, parser);
  }

  public registerPattern(
    pattern: RegExp,
    factory: (typeStr: string, match: RegExpMatchArray) => TypeParser
  ): void {
    this.patternParsers.push({ pattern, factory });
  }

  public getParser(canonicalType: string): TypeParser | undefined {
    const normKey = canonicalType.trim().toLowerCase();

    if (this.parsers.has(normKey)) {
      return this.parsers.get(normKey);
    }

    // Try registered pattern matchers (e.g. array<T>, matrix<T>)
    for (const item of this.patternParsers) {
      const match = canonicalType.trim().match(item.pattern);
      if (match) {
        return item.factory(canonicalType, match);
      }
    }

    // Fallback: parse canonical type info to construct standard collection or structure parser
    const parsed = parseCanonicalType(canonicalType);
    if (parsed.kind === 'collection_array' && parsed.elementType) {
      const elementParser = this.getParser(parsed.elementType.raw);
      if (elementParser) {
        return {
          id: `array<${elementParser.id}>`,
          canonicalType,
          kind: 'collection_array',
          elementType: elementParser,
          description: `Array of ${elementParser.canonicalType}`,
        };
      }
    } else if (parsed.kind === 'collection_matrix' && parsed.elementType) {
      const elementParser = this.getParser(parsed.elementType.raw);
      if (elementParser) {
        return {
          id: `matrix<${elementParser.id}>`,
          canonicalType,
          kind: 'collection_matrix',
          elementType: elementParser,
          description: `Matrix of ${elementParser.canonicalType}`,
        };
      }
    } else if (parsed.kind === 'structure') {
      return {
        id: `structure:${parsed.baseType}`,
        canonicalType,
        kind: 'structure',
        description: `Structure parser for ${parsed.baseType}`,
      };
    }

    return undefined;
  }

  public hasParser(canonicalType: string): boolean {
    return this.getParser(canonicalType) !== undefined;
  }

  public getAllRegisteredTypes(): string[] {
    return Array.from(this.parsers.keys());
  }

  private registerDefaults(): void {
    const primitives = ['int', 'long', 'float', 'double', 'bool', 'char', 'string', 'void'];
    for (const prim of primitives) {
      this.register(prim, {
        id: `primitive:${prim}`,
        canonicalType: prim,
        kind: 'primitive',
        description: `Primitive parser for ${prim}`,
      });
    }

    const structures = ['listnode', 'treenode', 'graphnode', 'interval', 'pair', 'nestedinteger'];
    for (const structName of structures) {
      const origName =
        structName === 'listnode'
          ? 'ListNode'
          : structName === 'treenode'
          ? 'TreeNode'
          : structName === 'graphnode'
          ? 'GraphNode'
          : structName === 'interval'
          ? 'Interval'
          : structName === 'pair'
          ? 'Pair'
          : 'NestedInteger';

      this.register(structName, {
        id: `structure:${origName}`,
        canonicalType: origName,
        kind: 'structure',
        description: `Data structure parser for ${origName}`,
      });
    }
  }
}
