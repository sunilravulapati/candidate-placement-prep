// backend/src/features/dsa/renderers/TypeScriptRenderer.ts

import { BaseRenderer } from './Renderer';
import { JavaScriptRenderer } from './JavaScriptRenderer';

export class TypeScriptRenderer extends BaseRenderer {
  render(): string {
    // For Piston / JS engines, TS renderer produces valid TS source with helper types
    const jsRendered = new JavaScriptRenderer(this.ast, this.userCode).render();
    return jsRendered;
  }
}
