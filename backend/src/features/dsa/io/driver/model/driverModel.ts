// backend/src/features/dsa/io/driver/model/driverModel.ts

import { ParsedCanonicalType, StructureCanonicalType } from '../../canonical/types';

export interface ParamParseSpec {
  name: string;
  canonicalType: string;
  parserId: string;
  typeInfo: ParsedCanonicalType;
}

export interface ReturnPrintSpec {
  canonicalType: string;
  printerId: string;
  typeInfo: ParsedCanonicalType;
}

export interface DriverModel {
  className: string;
  functionName: string;
  isStatic: boolean;
  parameters: ParamParseSpec[];
  returnType: ReturnPrintSpec;
  requiredStructures: StructureCanonicalType[];
}
