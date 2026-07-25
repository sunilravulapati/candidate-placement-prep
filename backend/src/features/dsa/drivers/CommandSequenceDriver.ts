// backend/src/features/dsa/drivers/CommandSequenceDriver.ts

import { BaseDriver, DriverAST } from './Driver';

export class CommandSequenceDriver extends BaseDriver {
  buildAST(): DriverAST {
    return {
      problemType: 'DESIGN',
      driverType: 'COMMAND_SEQUENCE',
      className: this.starterMeta.className || 'MyQueue',
      functionName: this.starterMeta.functionName || 'constructor',
      parameters: this.starterMeta.parameters || [],
      returnType: 'void',
      inputSerializers: ['COMMAND_SEQUENCE'],
      outputSerializer: 'ARRAY_ANY',
      designMethods: (this.starterMeta.methods || []).map((m) => ({
        name: m.name,
        parameters: m.parameters || [],
        returnType: m.returnType || 'void',
      })),
    };
  }
}
