// backend/src/features/dsa/io/driver/builder/driverBuilder.ts

import { StarterMetadata, parseCanonicalType, StructureCanonicalType } from '../../canonical/types';
import { DriverModel, ParamParseSpec, ReturnPrintSpec } from '../model/driverModel';
import { ParserRegistry } from '../../registry/parser/parserRegistry';
import { PrinterRegistry } from '../../registry/printer/printerRegistry';

export class DriverBuilder {
  /**
   * Constructs a language-independent DriverModel from problem StarterMetadata.
   */
  public static build(metadata: StarterMetadata): DriverModel {
    if (!metadata || !metadata.functionName) {
      throw new Error('Invalid StarterMetadata: functionName is required');
    }

    const className = metadata.className || 'Solution';
    const functionName = metadata.functionName;
    const isStatic = metadata.isStatic ?? false;

    const parserRegistry = ParserRegistry.getInstance();
    const printerRegistry = PrinterRegistry.getInstance();

    const structuresSet = new Set<StructureCanonicalType>();

    const parameters: ParamParseSpec[] = (metadata.parameters || []).map((p, idx) => {
      const typeInfo = parseCanonicalType(p.type);
      const parser = parserRegistry.getParser(p.type);
      
      this.collectStructures(typeInfo, structuresSet);

      return {
        name: p.name || `arg${idx}`,
        canonicalType: p.type,
        parserId: parser ? parser.id : `fallback:${p.type}`,
        typeInfo,
      };
    });

    const returnTypeStr = metadata.returnType || 'void';
    const returnTypeInfo = parseCanonicalType(returnTypeStr);
    const printer = printerRegistry.getPrinter(returnTypeStr);

    this.collectStructures(returnTypeInfo, structuresSet);

    const returnType: ReturnPrintSpec = {
      canonicalType: returnTypeStr,
      printerId: printer ? printer.id : `fallback:${returnTypeStr}`,
      typeInfo: returnTypeInfo,
    };

    return {
      className,
      functionName,
      isStatic,
      parameters,
      returnType,
      requiredStructures: Array.from(structuresSet),
    };
  }

  private static collectStructures(
    typeInfo: ReturnType<typeof parseCanonicalType>,
    set: Set<StructureCanonicalType>
  ): void {
    if (typeInfo.kind === 'structure') {
      set.add(typeInfo.baseType as StructureCanonicalType);
    } else if (
      (typeInfo.kind === 'collection_array' || typeInfo.kind === 'collection_matrix') &&
      typeInfo.elementType
    ) {
      this.collectStructures(typeInfo.elementType, set);
    }
  }
}
