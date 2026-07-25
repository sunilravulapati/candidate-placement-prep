// backend/src/features/dsa/drivers/TreeDriver.ts

import { BaseDriver, DriverAST } from './Driver';

export class TreeDriver extends BaseDriver {
  buildAST(): DriverAST {
    return {
      problemType: this.execMeta.problemType || 'FUNCTION',
      driverType: 'TREE',
      className: this.starterMeta.className || 'Solution',
      functionName: this.starterMeta.functionName,
      parameters: this.starterMeta.parameters || [],
      returnType: this.starterMeta.returnType || 'TreeNode*',
      inputSerializers: this.driverMeta.inputSerializers || ['TREE'],
      outputSerializer: this.driverMeta.outputSerializer || 'TREE',
    };
  }
}
