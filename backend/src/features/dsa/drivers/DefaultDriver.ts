// backend/src/features/dsa/drivers/DefaultDriver.ts

import { BaseDriver, DriverAST } from './Driver';

export class DefaultDriver extends BaseDriver {
  buildAST(): DriverAST {
    return {
      problemType: this.execMeta.problemType || this.starterMeta.problemType || 'FUNCTION',
      driverType: 'DEFAULT',
      className: this.starterMeta.className || 'Solution',
      functionName: this.starterMeta.functionName,
      parameters: this.starterMeta.parameters || [],
      returnType: this.starterMeta.returnType || 'void',
      inputSerializers: this.driverMeta.inputSerializers || this.execMeta.inputType || [],
      outputSerializer: this.driverMeta.outputSerializer || this.execMeta.outputType || 'void',
    };
  }
}
