// backend/src/features/dsa/io/index.ts

import { StarterMetadata, SupportedLanguage } from './canonical/types';
import { DriverModel } from './driver/model/driverModel';
import { DriverBuilder } from './driver/builder/driverBuilder';
import { getLanguageRenderer } from './driver/renderers';
import { ParserRegistry } from './registry/parser/parserRegistry';
import { PrinterRegistry } from './registry/printer/printerRegistry';
import { IOFrameworkValidator } from './validation/validator';

export * from './canonical/types';
export * from './driver/model/driverModel';
export * from './driver/builder/driverBuilder';
export * from './driver/renderers';
export * from './registry/parser/parserRegistry';
export * from './registry/printer/printerRegistry';
export * from './validation/validator';

export class IOFramework {
  /**
   * Constructs a language-independent DriverModel from StarterMetadata.
   */
  public static buildDriver(metadata: StarterMetadata): DriverModel {
    return DriverBuilder.build(metadata);
  }

  /**
   * Renders a DriverModel into executable source code for the specified target language.
   */
  public static renderDriver(model: DriverModel, language: SupportedLanguage): string {
    const renderer = getLanguageRenderer(language);
    return renderer.render(model);
  }

  /**
   * Pipeline helper: Metadata -> DriverModel IR -> Language Renderer -> Generated Source Code.
   */
  public static buildAndRender(metadata: StarterMetadata, language: SupportedLanguage): string {
    const model = this.buildDriver(metadata);
    return this.renderDriver(model, language);
  }

  /**
   * Validates starter metadata against the IO Framework registries and renderers.
   */
  public static validate(metadata: StarterMetadata) {
    return IOFrameworkValidator.validateMetadata(metadata);
  }

  /**
   * Generates a full framework audit report for an array of problem metadatas.
   */
  public static validateAll(metadatas: StarterMetadata[]) {
    return IOFrameworkValidator.generateReport(metadatas);
  }
}
