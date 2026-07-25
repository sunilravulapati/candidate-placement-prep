// backend/src/features/dsa/renderers/Renderer.ts

import { DriverAST } from '../drivers/Driver';

export abstract class BaseRenderer {
  constructor(protected ast: DriverAST, protected userCode: string) {}

  abstract render(): string;
}
