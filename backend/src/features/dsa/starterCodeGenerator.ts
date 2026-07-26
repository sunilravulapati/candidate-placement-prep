// backend/src/features/dsa/starterCodeGenerator.ts

import {
  SupportedLanguage,
  StarterMetadata,
  mapCanonicalToLanguage,
  ALL_SUPPORTED_LANGUAGES,
} from './canonicalTypes';

export class StarterCodeGenerator {
  /**
   * Generates a starter code template for the given problem metadata and target language.
   */
  public static generate(
    metadata: StarterMetadata,
    lang: SupportedLanguage
  ): string {
    const className = metadata.className || 'Solution';
    const funcName = metadata.functionName;
    const isStatic = metadata.isStatic ?? false;

    if (metadata.problemType === 'DESIGN' || (metadata.methods && metadata.methods.length > 0)) {
      return this.generateDesignClass(metadata, lang, className);
    }

    switch (lang) {
      case 'cpp':
        return this.generateCpp(metadata, className, funcName);
      case 'java':
        return this.generateJava(metadata, className, funcName, isStatic);
      case 'python':
        return this.generatePython(metadata, className, funcName);
      case 'javascript':
        return this.generateJavaScript(metadata, funcName);
      case 'typescript':
        return this.generateTypeScript(metadata, funcName);
    }
  }

  /**
   * Generates starter templates for all supported languages.
   */
  public static generateAll(
    metadata: StarterMetadata
  ): Record<SupportedLanguage, string> {
    const result: Partial<Record<SupportedLanguage, string>> = {};
    for (const lang of ALL_SUPPORTED_LANGUAGES) {
      result[lang] = this.generate(metadata, lang);
    }
    return result as Record<SupportedLanguage, string>;
  }

  private static generateDesignClass(
    metadata: StarterMetadata,
    lang: SupportedLanguage,
    className: string
  ): string {
    const methods = metadata.methods || [];
    const initParams = metadata.parameters || [];

    switch (lang) {
      case 'cpp': {
        const ctorParams = initParams.map((p) => `${mapCanonicalToLanguage(p.type, 'cpp')} ${p.name}`).join(', ');
        const methodStubs = methods
          .map((m) => {
            const retType = mapCanonicalToLanguage(m.returnType, 'cpp');
            const pStr = m.parameters.map((p) => `${mapCanonicalToLanguage(p.type, 'cpp')} ${p.name}`).join(', ');
            return `    ${retType} ${m.name}(${pStr}) {\n        \n    }`;
          })
          .join('\n\n');
        return `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nclass ${className} {\npublic:\n    ${className}(${ctorParams}) {\n        \n    }\n\n${methodStubs}\n};`;
      }
      case 'java': {
        const ctorParams = initParams.map((p) => `${mapCanonicalToLanguage(p.type, 'java')} ${p.name}`).join(', ');
        const methodStubs = methods
          .map((m) => {
            const retType = mapCanonicalToLanguage(m.returnType, 'java');
            const pStr = m.parameters.map((p) => `${mapCanonicalToLanguage(p.type, 'java')} ${p.name}`).join(', ');
            return `    public ${retType} ${m.name}(${pStr}) {\n        \n    }`;
          })
          .join('\n\n');
        return `class ${className} {\n    public ${className}(${ctorParams}) {\n        \n    }\n\n${methodStubs}\n}`;
      }
      case 'python': {
        const ctorParams = initParams.map((p) => `${p.name}: ${mapCanonicalToLanguage(p.type, 'python')}`).join(', ');
        const selfCtor = ctorParams.length > 0 ? `self, ${ctorParams}` : 'self';
        const methodStubs = methods
          .map((m) => {
            const retType = mapCanonicalToLanguage(m.returnType, 'python');
            const pStr = m.parameters.map((p) => `${p.name}: ${mapCanonicalToLanguage(p.type, 'python')}`).join(', ');
            const selfP = pStr.length > 0 ? `self, ${pStr}` : 'self';
            return `    def ${m.name}(${selfP}) -> ${retType}:\n        pass`;
          })
          .join('\n\n');
        return `class ${className}:\n    def __init__(${selfCtor}):\n        pass\n\n${methodStubs}`;
      }
      case 'javascript': {
        const ctorParamNames = initParams.map((p) => p.name).join(', ');
        const ctorStub = `var ${className} = function(${ctorParamNames}) {\n    \n};`;
        const methodStubs = methods
          .map((m) => {
            const pNames = m.parameters.map((p) => p.name).join(', ');
            const jsDoc = m.parameters.map((p) => ` * @param {${mapCanonicalToLanguage(p.type, 'javascript')}} ${p.name}`).join('\n');
            const retDoc = mapCanonicalToLanguage(m.returnType, 'javascript');
            return `/**\n${jsDoc ? jsDoc + '\n' : ''} * @return {${retDoc}}\n */\n${className}.prototype.${m.name} = function(${pNames}) {\n    \n};`;
          })
          .join('\n\n');
        return `${ctorStub}\n\n${methodStubs}`;
      }
      case 'typescript': {
        const ctorParams = initParams.map((p) => `${p.name}: ${mapCanonicalToLanguage(p.type, 'typescript')}`).join(', ');
        const methodStubs = methods
          .map((m) => {
            const retType = mapCanonicalToLanguage(m.returnType, 'typescript');
            const pStr = m.parameters.map((p) => `${p.name}: ${mapCanonicalToLanguage(p.type, 'typescript')}`).join(', ');
            return `    ${m.name}(${pStr}): ${retType} {\n        \n    }`;
          })
          .join('\n\n');
        return `class ${className} {\n    constructor(${ctorParams}) {\n        \n    }\n\n${methodStubs}\n}`;
      }
    }
  }

  private static generateCpp(
    metadata: StarterMetadata,
    className: string,
    funcName: string
  ): string {
    const returnType = mapCanonicalToLanguage(metadata.returnType, 'cpp');
    const params = metadata.parameters
      .map((p) => {
        const typeStr = mapCanonicalToLanguage(p.type, 'cpp');
        const isVectorOrString =
          typeStr.startsWith('vector') || typeStr === 'string';
        const paramType = isVectorOrString ? `vector<${typeStr.replace(/^vector</, '')}>&` : typeStr;
        return `${paramType} ${p.name}`;
      })
      .join(', ');

    return `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nclass ${className} {\npublic:\n    ${returnType} ${funcName}(${params}) {\n        // Write your code here\n    }\n};`;
  }

  private static generateJava(
    metadata: StarterMetadata,
    className: string,
    funcName: string,
    isStatic: boolean
  ): string {
    const returnType = mapCanonicalToLanguage(metadata.returnType, 'java');
    const params = metadata.parameters
      .map((p) => `${mapCanonicalToLanguage(p.type, 'java')} ${p.name}`)
      .join(', ');
    const staticKeyword = isStatic ? 'static ' : '';

    return `class ${className} {\n    public ${staticKeyword}${returnType} ${funcName}(${params}) {\n        // Write your code here\n    }\n}`;
  }

  private static generatePython(
    metadata: StarterMetadata,
    className: string,
    funcName: string
  ): string {
    const returnType = mapCanonicalToLanguage(metadata.returnType, 'python');
    const params = metadata.parameters
      .map((p) => `${p.name}: ${mapCanonicalToLanguage(p.type, 'python')}`)
      .join(', ');

    const selfPrefix = params.length > 0 ? 'self, ' : 'self';

    return `class ${className}:\n    def ${funcName}(${selfPrefix}${params}) -> ${returnType}:\n        pass`;
  }

  private static generateJavaScript(
    metadata: StarterMetadata,
    funcName: string
  ): string {
    const jsDocParams = metadata.parameters
      .map((p) => ` * @param {${mapCanonicalToLanguage(p.type, 'javascript')}} ${p.name}`)
      .join('\n');
    const returnTypeDoc = mapCanonicalToLanguage(metadata.returnType, 'javascript');
    const paramNames = metadata.parameters.map((p) => p.name).join(', ');

    return `/**\n${jsDocParams}\n * @return {${returnTypeDoc}}\n */\nvar ${funcName} = function(${paramNames}) {\n    \n};`;
  }

  private static generateTypeScript(
    metadata: StarterMetadata,
    funcName: string
  ): string {
    const returnType = mapCanonicalToLanguage(metadata.returnType, 'typescript');
    const params = metadata.parameters
      .map((p) => `${p.name}: ${mapCanonicalToLanguage(p.type, 'typescript')}`)
      .join(', ');

    return `function ${funcName}(${params}): ${returnType} {\n    \n};`;
  }
}

