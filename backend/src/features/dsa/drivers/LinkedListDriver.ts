// backend/src/features/dsa/drivers/LinkedListDriver.ts

import { BaseDriver, DriverAST } from './Driver';

export class LinkedListDriver extends BaseDriver {
  buildAST(): DriverAST {
    return {
      problemType: this.execMeta.problemType || 'FUNCTION',
      driverType: 'LINKED_LIST',
      className: this.starterMeta.className || 'Solution',
      functionName: this.starterMeta.functionName,
      parameters: this.starterMeta.parameters || [],
      returnType: this.starterMeta.returnType || 'ListNode*',
      inputSerializers: this.driverMeta.inputSerializers || ['LINKED_LIST'],
      outputSerializer: this.driverMeta.outputSerializer || 'LINKED_LIST',
    };
  }
}
