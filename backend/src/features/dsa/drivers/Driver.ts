// backend/src/features/dsa/drivers/Driver.ts

import { StarterMetadata, ExecutionMetadata, DriverMetadata, SupportedLanguage } from '../canonicalTypes';

export interface DriverAST {
  problemType: string;
  driverType: string;
  className: string;
  functionName: string;
  parameters: Array<{ name: string; type: string }>;
  returnType: string;
  inputSerializers: string[];
  outputSerializer: string;
  designMethods?: Array<{
    name: string;
    parameters: Array<{ name: string; type: string }>;
    returnType: string;
  }>;
}

export abstract class BaseDriver {
  constructor(
    protected starterMeta: StarterMetadata,
    protected execMeta: ExecutionMetadata,
    protected driverMeta: DriverMetadata
  ) {}

  abstract buildAST(): DriverAST;
}
