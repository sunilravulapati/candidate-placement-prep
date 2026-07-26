// backend/src/features/dsa/io/validation/validator.ts

import { StarterMetadata, SupportedLanguage, parseCanonicalType } from '../canonical/types';
import { ParserRegistry } from '../registry/parser/parserRegistry';
import { PrinterRegistry } from '../registry/printer/printerRegistry';
import { DriverBuilder } from '../driver/builder/driverBuilder';
import { getLanguageRenderer } from '../driver/renderers';

export interface ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  field?: string;
}

export interface IOFrameworkValidationReport {
  timestamp: string;
  status: 'passed' | 'failed';
  totalChecked: number;
  errorCount: number;
  warningCount: number;
  registeredParserTypes: string[];
  registeredPrinterTypes: string[];
  issues: ValidationIssue[];
}

export class IOFrameworkValidator {
  /**
   * Validates starter metadata against registered parsers, printers, and target renderers.
   */
  public static validateMetadata(
    metadata: StarterMetadata,
    supportedLangs: SupportedLanguage[] = ['cpp', 'java', 'python', 'javascript', 'typescript']
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!metadata) {
      issues.push({
        severity: 'error',
        code: 'MISSING_METADATA',
        message: 'StarterMetadata object is null or undefined.',
      });
      return issues;
    }

    if (!metadata.functionName || metadata.functionName.trim().length === 0) {
      issues.push({
        severity: 'error',
        code: 'INVALID_FUNCTION_NAME',
        message: 'StarterMetadata functionName is missing or empty.',
        field: 'functionName',
      });
    }

    const parserRegistry = ParserRegistry.getInstance();
    const printerRegistry = PrinterRegistry.getInstance();

    // Check parameters
    (metadata.parameters || []).forEach((param, index) => {
      if (!param.type) {
        issues.push({
          severity: 'error',
          code: 'MISSING_PARAM_TYPE',
          message: `Parameter at index ${index} (${param.name || 'unnamed'}) missing type.`,
          field: `parameters[${index}].type`,
        });
        return;
      }

      if (!parserRegistry.hasParser(param.type)) {
        issues.push({
          severity: 'error',
          code: 'UNSUPPORTED_PARAM_TYPE',
          message: `No registered parser found for canonical parameter type: ${param.type}`,
          field: `parameters[${index}].type`,
        });
      }
    });

    // Check return type
    const returnType = metadata.returnType || 'void';
    if (!printerRegistry.hasPrinter(returnType)) {
      issues.push({
        severity: 'error',
        code: 'UNSUPPORTED_RETURN_TYPE',
        message: `No registered printer found for canonical return type: ${returnType}`,
        field: 'returnType',
      });
    }

    // Verify build & rendering across languages
    if (issues.filter((i) => i.severity === 'error').length === 0) {
      try {
        const model = DriverBuilder.build(metadata);
        for (const lang of supportedLangs) {
          try {
            const renderer = getLanguageRenderer(lang);
            const renderedCode = renderer.render(model);
            if (!renderedCode || renderedCode.trim().length === 0) {
              issues.push({
                severity: 'error',
                code: 'EMPTY_RENDERED_OUTPUT',
                message: `Renderer for ${lang} produced an empty code string.`,
              });
            }
          } catch (renderErr: any) {
            issues.push({
              severity: 'error',
              code: 'RENDERER_FAILURE',
              message: `Language renderer for ${lang} failed: ${renderErr?.message || renderErr}`,
            });
          }
        }
      } catch (buildErr: any) {
        issues.push({
          severity: 'error',
          code: 'BUILDER_FAILURE',
          message: `DriverBuilder failed to construct DriverModel: ${buildErr?.message || buildErr}`,
        });
      }
    }

    return issues;
  }

  /**
   * Generates a full framework audit report.
   */
  public static generateReport(sampleMetadatas: StarterMetadata[] = []): IOFrameworkValidationReport {
    const parserRegistry = ParserRegistry.getInstance();
    const printerRegistry = PrinterRegistry.getInstance();

    const allIssues: ValidationIssue[] = [];
    let totalChecked = 0;

    for (const meta of sampleMetadatas) {
      totalChecked++;
      const issues = this.validateMetadata(meta);
      allIssues.push(...issues);
    }

    const errorCount = allIssues.filter((i) => i.severity === 'error').length;
    const warningCount = allIssues.filter((i) => i.severity === 'warning').length;

    return {
      timestamp: new Date().toISOString(),
      status: errorCount === 0 ? 'passed' : 'failed',
      totalChecked,
      errorCount,
      warningCount,
      registeredParserTypes: parserRegistry.getAllRegisteredTypes(),
      registeredPrinterTypes: printerRegistry.getAllRegisteredTypes(),
      issues: allIssues,
    };
  }
}
