// backend/src/features/dsa/drivers/MatrixDriver.ts

import { BaseDriver, DriverAST } from './Driver';

export class MatrixDriver extends BaseDriver {
  buildAST(): DriverAST {
    return {
      problemType: this.execMeta.problemType || 'FUNCTION',
      driverType: 'MATRIX',
      className: this.starterMeta.className || 'Solution',
      functionName: this.starterMeta.functionName,
      parameters: this.starterMeta.parameters || [],
      returnType: this.starterMeta.returnType || 'matrix<int>',
      inputSerializers: this.driverMeta.inputSerializers || ['MATRIX_INT'],
      outputSerializer: this.driverMeta.outputSerializer || 'MATRIX_INT',
    };
  }
}
