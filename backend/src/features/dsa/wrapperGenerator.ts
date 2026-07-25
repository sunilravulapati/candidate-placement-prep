// backend/src/features/dsa/wrapperGenerator.ts

import { StarterMetadata, ExecutionMetadata, DriverMetadata, SupportedLanguage } from './canonicalTypes';
import { DefaultDriver } from './drivers/DefaultDriver';
import { LinkedListDriver } from './drivers/LinkedListDriver';
import { TreeDriver } from './drivers/TreeDriver';
import { GraphDriver } from './drivers/GraphDriver';
import { CommandSequenceDriver } from './drivers/CommandSequenceDriver';
import { MatrixDriver } from './drivers/MatrixDriver';

import { CppRenderer } from './renderers/CppRenderer';
import { JavaRenderer } from './renderers/JavaRenderer';
import { PythonRenderer } from './renderers/PythonRenderer';
import { JavaScriptRenderer } from './renderers/JavaScriptRenderer';
import { TypeScriptRenderer } from './renderers/TypeScriptRenderer';

export class WrapperGenerator {
  /**
   * Generates a hidden execution wrapper around the user's solution.
   */
  public static generateWrapper(
    metadata: StarterMetadata,
    execMetadata: ExecutionMetadata,
    userCode: string,
    lang: SupportedLanguage,
    driverMetadata?: DriverMetadata
  ): string {
    const dMeta: DriverMetadata = driverMetadata || {
      driver: execMetadata.problemType === 'DESIGN' || metadata.problemType === 'DESIGN'
        ? 'COMMAND_SEQUENCE'
        : execMetadata.comparator === 'LINKED_LIST'
        ? 'LINKED_LIST'
        : execMetadata.comparator === 'TREE'
        ? 'TREE'
        : execMetadata.comparator === 'GRAPH'
        ? 'GRAPH'
        : execMetadata.comparator === 'MATRIX'
        ? 'MATRIX'
        : 'DEFAULT',
    };

    // 1. Select Driver
    let driver;
    switch (dMeta.driver) {
      case 'LINKED_LIST':
        driver = new LinkedListDriver(metadata, execMetadata, dMeta);
        break;
      case 'TREE':
        driver = new TreeDriver(metadata, execMetadata, dMeta);
        break;
      case 'GRAPH':
        driver = new GraphDriver(metadata, execMetadata, dMeta);
        break;
      case 'COMMAND_SEQUENCE':
        driver = new CommandSequenceDriver(metadata, execMetadata, dMeta);
        break;
      case 'MATRIX':
        driver = new MatrixDriver(metadata, execMetadata, dMeta);
        break;
      case 'DEFAULT':
      default:
        driver = new DefaultDriver(metadata, execMetadata, dMeta);
        break;
    }

    // 2. Build AST
    const ast = driver.buildAST();

    // 3. Render for Language
    switch (lang) {
      case 'cpp':
        return new CppRenderer(ast, userCode).render();
      case 'java':
        return new JavaRenderer(ast, userCode).render();
      case 'python':
        return new PythonRenderer(ast, userCode).render();
      case 'javascript':
        return new JavaScriptRenderer(ast, userCode).render();
      case 'typescript':
        return new TypeScriptRenderer(ast, userCode).render();
    }
  }
}
