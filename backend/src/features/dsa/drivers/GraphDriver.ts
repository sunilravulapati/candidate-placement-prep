// backend/src/features/dsa/drivers/GraphDriver.ts

import { BaseDriver, DriverAST } from './Driver';

export class GraphDriver extends BaseDriver {
  buildAST(): DriverAST {
    return {
      problemType: this.execMeta.problemType || 'FUNCTION',
      driverType: 'GRAPH',
      className: this.starterMeta.className || 'Solution',
      functionName: this.starterMeta.functionName,
      parameters: this.starterMeta.parameters || [],
      returnType: this.starterMeta.returnType || 'GraphNode*',
      inputSerializers: this.driverMeta.inputSerializers || ['GRAPH_ADJ'],
      outputSerializer: this.driverMeta.outputSerializer || 'GRAPH_ADJ',
    };
  }
}
