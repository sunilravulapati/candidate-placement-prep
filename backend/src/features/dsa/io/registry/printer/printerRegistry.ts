// backend/src/features/dsa/io/registry/printer/printerRegistry.ts

import { TypePrinter } from './printers';
import { parseCanonicalType } from '../../canonical/types';

export class PrinterRegistry {
  private static instance: PrinterRegistry;
  private printers = new Map<string, TypePrinter>();
  private patternPrinters: Array<{
    pattern: RegExp;
    factory: (typeStr: string, match: RegExpMatchArray) => TypePrinter;
  }> = [];

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): PrinterRegistry {
    if (!PrinterRegistry.instance) {
      PrinterRegistry.instance = new PrinterRegistry();
    }
    return PrinterRegistry.instance;
  }

  public register(typeKey: string, printer: TypePrinter): void {
    const key = typeKey.trim().toLowerCase();
    this.printers.set(key, printer);
  }

  public registerPattern(
    pattern: RegExp,
    factory: (typeStr: string, match: RegExpMatchArray) => TypePrinter
  ): void {
    this.patternPrinters.push({ pattern, factory });
  }

  public getPrinter(canonicalType: string): TypePrinter | undefined {
    const normKey = canonicalType.trim().toLowerCase();

    if (this.printers.has(normKey)) {
      return this.printers.get(normKey);
    }

    for (const item of this.patternPrinters) {
      const match = canonicalType.trim().match(item.pattern);
      if (match) {
        return item.factory(canonicalType, match);
      }
    }

    const parsed = parseCanonicalType(canonicalType);
    if (parsed.kind === 'collection_array' && parsed.elementType) {
      const elementPrinter = this.getPrinter(parsed.elementType.raw);
      if (elementPrinter) {
        return {
          id: `array<${elementPrinter.id}>`,
          canonicalType,
          kind: 'collection_array',
          elementType: elementPrinter,
          description: `Array printer for ${elementPrinter.canonicalType}`,
        };
      }
    } else if (parsed.kind === 'collection_matrix' && parsed.elementType) {
      const elementPrinter = this.getPrinter(parsed.elementType.raw);
      if (elementPrinter) {
        return {
          id: `matrix<${elementPrinter.id}>`,
          canonicalType,
          kind: 'collection_matrix',
          elementType: elementPrinter,
          description: `Matrix printer for ${elementPrinter.canonicalType}`,
        };
      }
    } else if (parsed.kind === 'structure') {
      return {
        id: `structure:${parsed.baseType}`,
        canonicalType,
        kind: 'structure',
        description: `Data structure printer for ${parsed.baseType}`,
      };
    }

    return undefined;
  }

  public hasPrinter(canonicalType: string): boolean {
    return this.getPrinter(canonicalType) !== undefined;
  }

  public getAllRegisteredTypes(): string[] {
    return Array.from(this.printers.keys());
  }

  private registerDefaults(): void {
    const primitives = ['int', 'long', 'float', 'double', 'bool', 'char', 'string', 'void'];
    for (const prim of primitives) {
      this.register(prim, {
        id: `primitive:${prim}`,
        canonicalType: prim,
        kind: 'primitive',
        description: `Primitive printer for ${prim}`,
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
        description: `Data structure printer for ${origName}`,
      });
    }
  }
}
