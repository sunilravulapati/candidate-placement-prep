// backend/src/features/dsa/io/driver/renderers/baseRenderer.ts

import { DriverModel } from '../model/driverModel';
import { SupportedLanguage } from '../../canonical/types';

export abstract class BaseLanguageRenderer {
  public abstract readonly language: SupportedLanguage;

  /**
   * Renders the language-independent DriverModel into executable source code.
   */
  public abstract render(model: DriverModel): string;

  protected indent(code: string, spaces: number = 4): string {
    const pad = ' '.repeat(spaces);
    return code
      .split('\n')
      .map((line) => (line.trim().length > 0 ? `${pad}${line}` : line))
      .join('\n');
  }
}
